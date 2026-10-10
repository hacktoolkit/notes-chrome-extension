// Service worker: owns every operation. The popup and options page only send
// messages. Presence badge, reminders, snoozed tabs, context menu capture.

import { loadSettings } from './lib/settings.js';
import { compileRules } from './lib/url.js';
import {
    addEntry, addSnapshot, fileNameFor, fromMarkdown, identify, mergeNotes, matchesQuery, newNote,
    presetTime, removeEntry, setReminder, setToday, toMarkdown, todayIndex, updateEntry
} from './lib/notes.js';

// The popup does not need snapshot bodies; keep its messages small.
function stripForPopup(note) {
    return { ...note, snapshots: (note.snapshots || []).map(({ text, ...rest }) => ({ ...rest, chars: text?.length || 0 })), snapshot: note.snapshot ? { at: note.snapshot.at, title: note.snapshot.title } : null };
}
import { allNotes, deleteNote, getIndex, getNote, putNote, rebuildIndex, writeToVault } from './lib/store.js';
import { makeZip } from './lib/zip.js';
import { analyzeProfile, captureBudget, diffLines, diffProfiles, extractorFor } from './lib/profile.js';

// ----- context --------------------

async function ctx() {
    const { settings } = await loadSettings();
    const { compiled } = compileRules(settings.rules);
    return { settings, compiled };
}

async function noteForUrl(url) {
    const c = await ctx();
    const ident = identify(url, c.compiled, c.settings.normalization);
    const note = await getNote(ident.id);
    return { ident, note, settings: c.settings };
}

async function tabFor(args) {
    if (args.tabId) {
        try { return await chrome.tabs.get(args.tabId); } catch (e) { /* gone */ }
    }
    const [t] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    return t || null;
}

// Page capture via the activeTab grant from the user's click: title, core
// metadata (canonical, OpenGraph, author, published, JSON-LD types) and the
// page text, line structure preserved so site parsers can read it.
async function capturePage(tabId, { maxChars = 6000 } = {}) {
    try {
        const [r] = await chrome.scripting.executeScript({
            target: { tabId },
            args: [maxChars],
            func: (limit) => {
                const q = (sel) => document.querySelector(sel)?.getAttribute('content') || '';
                const meta = {
                    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
                    siteName: q('meta[property="og:site_name"]'),
                    ogType: q('meta[property="og:type"]'),
                    ogTitle: q('meta[property="og:title"]'),
                    author: q('meta[name="author"]') || q('meta[property="article:author"]'),
                    published: q('meta[property="article:published_time"]') || q('meta[name="date"]'),
                    modified: q('meta[property="article:modified_time"]'),
                    lang: document.documentElement.lang || '',
                    jsonLdTypes: [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => {
                        try { const j = JSON.parse(s.textContent); return [].concat(j).map((x) => x && x['@type']).filter(Boolean); } catch (e) { return []; }
                    }).slice(0, 8)
                };
                const text = (document.body?.innerText || '').replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n').trim();
                return {
                    title: document.title,
                    description: q('meta[name="description"]') || q('meta[property="og:description"]'),
                    selection: String(window.getSelection() || '').slice(0, 2000),
                    text: text.slice(0, limit),
                    truncated: text.length > limit,
                    meta
                };
            }
        });
        return r?.result || null;
    } catch (e) {
        return null; // no activeTab grant (no user gesture), chrome:// page, etc.
    }
}

// Runs the site extractor for the page's rule, if any, on a capture.
function structure(ident, capture) {
    const extractor = extractorFor(ident?.rule);
    if (!extractor || !capture?.text) return null;
    try { return extractor(capture.text); } catch (e) { return null; }
}

// One place for "capture this tab for this page identity": the budget comes
// from the parser registry, and the structured parse rides along. Tests pass
// a ready capture in args.snapshot.
async function captureFor(tab, ident, args) {
    const cap = args.snapshot || (tab ? await capturePage(tab.id, { maxChars: captureBudget(ident.rule) }) : null);
    return cap ? { ...cap, structured: structure(ident, cap) } : null;
}

// Insights for a note: analysis of the newest structured capture, edits since
// the previous capture, and a plain-text diff for any page.
function insightsFor(note) {
    const snaps = note?.snapshots || [];
    if (snaps.length === 0) return null;
    const newest = snaps[snaps.length - 1];
    const previous = snaps.length > 1 ? snaps[snaps.length - 2] : null;
    const out = { capturedAt: newest.at, seenAt: newest.seen, captures: snaps.length, meta: newest.meta || null, kind: newest.structured?.kind || null };
    if (newest.structured) {
        const { findings, summary } = analyzeProfile(newest.structured);
        out.findings = findings;
        out.summary = summary;
        out.profile = { name: newest.structured.name, headline: newest.structured.headline, location: newest.structured.location, experience: newest.structured.experience, education: newest.structured.education };
        if (previous?.structured) out.edits = diffProfiles(previous.structured, newest.structured);
    }
    if (previous) {
        const d = diffLines(previous.text, newest.text);
        out.changed = { since: previous.at, titleChanged: previous.title !== newest.title, added: d.added.slice(0, 12), removed: d.removed.slice(0, 12), addedCount: d.added.length, removedCount: d.removed.length };
    }
    return out;
}

async function persist(note, settings) {
    const saved = await putNote(note);
    if (saved && settings.writeToVault) {
        await writeToVault(fileNameFor(saved), toMarkdown(saved));
    }
    await syncReminder(saved || note);
    scheduleBadgeForAll();
    return saved;
}

// ----- messages --------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handle(message)
        .then((result) => sendResponse({ ok: true, result }))
        .catch((error) => { console.error(message, error); sendResponse({ ok: false, error: error.message || String(error) }); });
    return true;
});

async function handle({ type, args = {} } = {}) {
    switch (type) {
        case 'current': {
            const tab = await tabFor(args);
            if (!tab || !tab.url) return { tab: null, note: null };
            let { ident, note, settings } = await noteForUrl(tab.url);
            // Opening the popup is a user action on this tab: keep what the
            // page looks like now. A page with no note yet gets a capture-only
            // note, which stays out of the way until something is written.
            if (settings.snapshotOnSave && args.capture !== false && /^https?:/.test(tab.url)) {
                const cap = await captureFor(tab, ident, args);
                if (cap) {
                    const base = note || newNote({ url: tab.url, title: tab.title || tab.url, key: ident.key, rule: ident.rule });
                    const next = addSnapshot(base, cap);
                    if (next !== note) note = await putNote(next);
                }
            }
            return { tab: { id: tab.id, url: tab.url, title: tab.title, favIconUrl: tab.favIconUrl || '' }, ident, note: note ? stripForPopup(note) : null, insights: note ? insightsFor(note) : null, today: note ? todayIndex(note) : -1 };
        }
        case 'capture': {
            // user asked to keep what this page looks like, with no entry yet
            const tab = await tabFor(args);
            if (!tab?.url) throw new Error('No page to capture');
            const { ident, note, settings } = await noteForUrl(tab.url);
            const cap = await captureFor(tab, ident, args);
            if (!cap) throw new Error('Could not read this page. Chrome pages and some sites cannot be captured.');
            let next = note || newNote({ url: tab.url, title: tab.title || tab.url, key: ident.key, rule: ident.rule });
            next = addSnapshot(next, cap);
            const saved = await persist(next, settings);
            return { note: saved ? stripForPopup(saved) : null, insights: saved ? insightsFor(saved) : null };
        }
        case 'insights': {
            const note = await getNote(args.id);
            return note ? insightsFor(note) : null;
        }
        case 'detail': {
            const note = await getNote(args.id);
            if (!note) throw new Error('Note not found');
            return { note, insights: insightsFor(note) };
        }
        case 'addEntry': {
            const tab = await tabFor(args);
            const url = args.url || tab?.url;
            if (!url) throw new Error('No page to attach the note to');
            const { ident, note, settings } = await noteForUrl(url);
            let next = note || newNote({ url, title: args.title || tab?.title || url, key: ident.key, rule: ident.rule });
            next = addEntry(next, args.text);
            if (settings.snapshotOnSave && tab) {
                const cap = await captureFor(tab, ident, args);
                if (cap) next = addSnapshot(next, cap);
            }
            const saved = await persist(next, settings);
            return saved ? stripForPopup(saved) : saved;
        }
        case 'draft': {
            // autosave from the popup editor: today's entry follows the text
            const tab = await tabFor(args);
            const url = args.url || tab?.url;
            if (!url) throw new Error('No page to attach the note to');
            const { ident, note, settings } = await noteForUrl(url);
            const base = note || newNote({ url, title: args.title || tab?.title || url, key: ident.key, rule: ident.rule });
            const next = setToday(base, args.text);
            if (next === base && note) return { note: stripForPopup(note), today: todayIndex(note) };
            const saved = await persist(next, settings);
            return { note: saved ? stripForPopup(saved) : null, today: saved ? todayIndex(saved) : -1 };
        }
        case 'updateEntry': {
            const note = await getNote(args.id);
            if (!note) throw new Error('Note not found');
            return persist(updateEntry(note, args.index, args.text), (await ctx()).settings);
        }
        case 'removeEntry': {
            const note = await getNote(args.id);
            if (!note) throw new Error('Note not found');
            return persist(removeEntry(note, args.index), (await ctx()).settings);
        }
        case 'setReminder': {
            const note = await getNote(args.id);
            if (!note) throw new Error('Note not found');
            const when = args.preset ? presetTime(args.preset) : args.when;
            return persist(setReminder(note, when), (await ctx()).settings);
        }
        case 'snoozeTab': {
            const tab = await tabFor(args);
            if (!tab?.url) throw new Error('No tab to snooze');
            const when = args.preset ? presetTime(args.preset) : args.when;
            if (!when) throw new Error('No time given');
            const { ident, note, settings } = await noteForUrl(tab.url);
            let next = note || newNote({ url: tab.url, title: tab.title, key: ident.key, rule: ident.rule });
            next = addEntry(next, args.text || `Snoozed until ${new Date(when).toLocaleString()}.`);
            next = setReminder(next, when);
            await persist(next, settings);
            await chrome.tabs.remove(tab.id);
            return { when };
        }
        case 'deleteNote': {
            await deleteNote(args.id);
            await chrome.alarms.clear(`remind:${args.id}`);
            scheduleBadgeForAll();
            return true;
        }
        case 'get':
            return getNote(args.id);
        case 'list': {
            const index = await getIndex();
            let rows = Object.values(index);
            if (!args.includeCaptures) rows = rows.filter((r) => r.entries > 0 || r.remind);
            if (args.query) {
                const notes = await allNotes();
                const ids = new Set(notes.filter((n) => matchesQuery(n, args.query)).map((n) => n.id));
                rows = rows.filter((r) => ids.has(r.id));
            }
            rows.sort((a, b) => b.updated.localeCompare(a.updated));
            return rows;
        }
        case 'reminders': {
            const index = await getIndex();
            return Object.values(index).filter((r) => r.remind).sort((a, b) => a.remind.localeCompare(b.remind));
        }
        case 'export': {
            const notes = await allNotes();
            const files = notes.map((n) => ({ name: fileNameFor(n), text: toMarkdown(n) }));
            // captures ride along as plain text so the local cache is backed up too
            for (const n of notes) {
                for (const c of n.snapshots || []) {
                    const stamp = c.at.replace(/[:.]/g, '-');
                    const head = [`title: ${c.title || ''}`, `url: ${n.url}`, `captured: ${c.at}`, c.seen && c.seen !== c.at ? `seen: ${c.seen}` : null, c.meta?.siteName ? `site: ${c.meta.siteName}` : null, c.meta?.author ? `author: ${c.meta.author}` : null, c.meta?.published ? `published: ${c.meta.published}` : null].filter(Boolean).join('\n');
                    files.push({ name: `captures/${fileNameFor(n).replace(/\.md$/, '')}/${stamp}.txt`, text: `${head}\n\n${c.text || ''}` });
                }
            }
            const zip = makeZip(files);
            // base64 so it crosses the message boundary
            let bin = '';
            for (let i = 0; i < zip.length; i += 0x8000) bin += String.fromCharCode.apply(null, zip.subarray(i, i + 0x8000));
            return { count: notes.length, files: files.length, base64: btoa(bin) };
        }
        case 'import': {
            const { settings } = await ctx();
            let imported = 0;
            let merged = 0;
            const errors = [];
            for (const file of args.files || []) {
                try {
                    const incoming = fromMarkdown(file.text);
                    const existing = await getNote(incoming.id);
                    await persist(mergeNotes(existing, incoming, new Date()), settings);
                    existing ? merged++ : imported++;
                } catch (e) {
                    errors.push(`${file.name}: ${e.message}`);
                }
            }
            await rebuildIndex();
            return { imported, merged, errors };
        }
        case 'writeAllToVault': {
            const notes = await allNotes();
            let written = 0;
            let status = 'no-vault';
            for (const n of notes) {
                status = await writeToVault(fileNameFor(n), toMarkdown(n));
                if (status === 'written') written++;
                else break;
            }
            return { written, status, total: notes.length };
        }
        case 'settingsChanged':
            scheduleBadgeForAll();
            return true;
        default:
            throw new Error(`Unknown message type ${type}`);
    }
}

// ----- presence badge --------------------

const badgeTimers = new Map();
let allBadgeTimer = null;

// Badges come from the index (canonical key -> entry count), so a pass over
// every tab costs one settings load, one rule compile and one index read.
async function badgeContext() {
    const c = await ctx();
    const index = await getIndex();
    const byKey = new Map(Object.values(index).map((r) => [r.key, r]));
    return { ...c, byKey };
}

async function applyBadge(tab, bc) {
    try {
        if (!bc.settings.showBadge || !tab.url) return chrome.action.setBadgeText({ tabId: tab.id, text: '' });
        const ident = identify(tab.url, bc.compiled, bc.settings.normalization);
        const row = bc.byKey.get(ident.key);
        await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: '#5b6cff' });
        await chrome.action.setBadgeText({ tabId: tab.id, text: row ? String(row.entries || '●') : '' });
        await chrome.action.setTitle({ tabId: tab.id, title: row ? `${APP_NAME}: ${row.entries} entries here` : APP_NAME });
    } catch (e) { /* tab gone */ }
}

async function updateBadge(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        await applyBadge(tab, await badgeContext());
    } catch (e) { /* tab gone */ }
}

function scheduleBadge(tabId) {
    clearTimeout(badgeTimers.get(tabId));
    badgeTimers.set(tabId, setTimeout(() => { badgeTimers.delete(tabId); updateBadge(tabId); }, 300));
}

function scheduleBadgeForAll() {
    clearTimeout(allBadgeTimer);
    allBadgeTimer = setTimeout(async () => {
        allBadgeTimer = null;
        try {
            const bc = await badgeContext();
            for (const t of await chrome.tabs.query({})) await applyBadge(t, bc);
        } catch (e) { /* ignore */ }
    }, 300);
}

chrome.tabs.onActivated.addListener(({ tabId }) => scheduleBadge(tabId));
chrome.tabs.onUpdated.addListener((tabId, info) => { if (info.url || info.status === 'complete') scheduleBadge(tabId); });

// ----- reminders --------------------

async function syncReminder(note) {
    const name = `remind:${note.id}`;
    await chrome.alarms.clear(name);
    if (note.remind) {
        const when = new Date(note.remind).getTime();
        chrome.alarms.create(name, { when: Math.max(when, Date.now() + 1000) });
    }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (!alarm.name.startsWith('remind:')) return;
    const id = alarm.name.slice('remind:'.length);
    const note = await getNote(id);
    if (!note) return;
    const { settings } = await loadSettings();
    const last = note.entries[note.entries.length - 1];
    try {
        await chrome.notifications.create(`note:${id}`, {
            type: 'basic',
            iconUrl: chrome.runtime.getURL('img/icon128.png'),
            title: note.title,
            message: last ? last.text.slice(0, 200) : 'Reminder',
            priority: 1
        });
    } catch (e) { /* notifications may be disabled */ }
    if (settings.openTabOnReminder) {
        try { await chrome.tabs.create({ url: note.url, active: true }); } catch (e) { /* ignore */ }
    }
    await putNote(setReminder(note, null));
    scheduleBadgeForAll();
});

chrome.notifications.onClicked.addListener(async (nid) => {
    if (!nid.startsWith('note:')) return;
    const note = await getNote(nid.slice(5));
    if (note) chrome.tabs.create({ url: note.url, active: true });
    chrome.notifications.clear(nid);
});

// Re-arm alarms after a browser restart (alarms survive, but be safe).
async function rearmReminders() {
    const index = await getIndex();
    for (const row of Object.values(index)) {
        if (row.remind) {
            const existing = await chrome.alarms.get(`remind:${row.id}`);
            if (!existing) chrome.alarms.create(`remind:${row.id}`, { when: Math.max(new Date(row.remind).getTime(), Date.now() + 1000) });
        }
    }
}

// ----- context menu and commands --------------------

const APP_NAME = chrome.runtime.getManifest().name;
const MENU = { addSelection: 'addSelection', snooze: 'snoozeTab' };
let menuBuild = Promise.resolve();
function rebuildMenus() {
    menuBuild = menuBuild.then(buildMenus, buildMenus);
    return menuBuild;
}
async function buildMenus() {
    await chrome.contextMenus.removeAll();
    chrome.contextMenus.create({ id: MENU.addSelection, title: 'Add selection to this page\'s note', contexts: ['selection'] });
    chrome.contextMenus.create({ id: MENU.snooze, title: 'Snooze this tab until tomorrow 9:00', contexts: ['page', 'action'] });
}
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    try {
        if (info.menuItemId === MENU.addSelection && info.selectionText) {
            const quote = info.selectionText.trim().split('\n').map((l) => `> ${l}`).join('\n');
            await handle({ type: 'addEntry', args: { tabId: tab?.id, url: info.pageUrl || tab?.url, title: tab?.title, text: quote } });
        } else if (info.menuItemId === MENU.snooze) {
            await handle({ type: 'snoozeTab', args: { tabId: tab?.id, preset: 'tomorrow' } });
        }
    } catch (e) { console.error(e); }
});
chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command === 'snoozeTab') {
        try { await handle({ type: 'snoozeTab', args: { tabId: tab?.id, preset: 'tomorrow' } }); } catch (e) { console.error(e); }
    }
});

// ----- lifecycle --------------------

chrome.runtime.onInstalled.addListener(async (details) => {
    await rebuildMenus();
    await rearmReminders();
    scheduleBadgeForAll();
    if (details.reason === 'install') chrome.runtime.openOptionsPage();
});
chrome.runtime.onStartup.addListener(() => { rebuildMenus(); rearmReminders(); scheduleBadgeForAll(); });
scheduleBadgeForAll();
