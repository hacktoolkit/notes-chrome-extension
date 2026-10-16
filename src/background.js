// Service worker: owns every operation. The popup and options page only send
// messages. Presence badge, reminders, snoozed tabs, context menu capture.

import { loadSettings } from './lib/settings.js';
import { compileRules } from './lib/url.js';
import {
    addEntry, addSnapshot, addSticky, feedbackMarkdown, fileNameFor, fromMarkdown, identify, linkNotes, mergeNotes, matchesQuery, newNote, noteId,
    presetTime, removeEntry, removeSticky, setReminder, setToday, toMarkdown, todayIndex, unlinkNotes, updateEntry, updateSticky
} from './lib/notes.js';

// The popup does not need snapshot bodies; keep its messages small.
function stripForPopup(note) {
    return { ...note, snapshots: (note.snapshots || []).map(({ text, ...rest }) => ({ ...rest, chars: text?.length || 0 })), snapshot: note.snapshot ? { at: note.snapshot.at, title: note.snapshot.title } : null };
}
import { allNotes, deleteNote, getIndex, getNote, migrateNoteTitles, putNote, rebuildIndex, vaultFolder } from './lib/store.js';
import { STATE_KEY, STATUS_KEY, SYNC_ALARM, SYNC_PERIOD_MINUTES, emptyState, hashText, memoryFolder, syncFolder, worthAFile } from './lib/vault.js';
import { applyShare, decodeShare, encodeShare, shareFileName, sharePayload } from './lib/share.js';
import { makeZip } from './lib/zip.js';
import { analyzeProfile, captureBudget, diffLines, diffProfiles, extractorFor } from './lib/profile.js';

const storageReady = migrateNoteTitles();
const VISIBILITY_KEY = 'stickies:visible';
const WIDGET_KEY = 'widget:layout';
async function stickyVisibility() {
    return (await chrome.storage.local.get(VISIBILITY_KEY))[VISIBILITY_KEY] !== false;
}

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
    // a side panel belongs to one window: follow that window's active tab
    const [t] = await chrome.tabs.query(args.windowId ? { active: true, windowId: args.windowId } : { active: true, lastFocusedWindow: true });
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
    if (saved && settings.writeToVault) await vaultWrite(saved);
    await syncReminder(saved || note);
    scheduleBadgeForAll();
    return saved;
}

// ----- vault: the folder shared between profiles --------------------

async function vaultState() { return (await chrome.storage.local.get(STATE_KEY))[STATE_KEY] || emptyState(); }
async function setVaultState(state) { await chrome.storage.local.set({ [STATE_KEY]: state }); }
async function vaultStatus() { return (await chrome.storage.local.get(STATUS_KEY))[STATUS_KEY] || { result: 'never' }; }
async function setVaultStatus(patch) { await chrome.storage.local.set({ [STATUS_KEY]: { ...(await vaultStatus()), ...patch } }); }

// One note, written now (a save). The sync records what the folder holds so
// the next scan does not read our own write back.
async function vaultWrite(note) {
    const { status, folder } = await vaultFolder();
    if (status !== 'ok') { await setVaultStatus({ result: status }); return status; }
    if (!worthAFile(note)) return 'skipped';
    try {
        const state = await vaultState();
        const text = toMarkdown(note);
        const name = fileNameFor(note);
        const meta = await folder.write(name, text);
        for (const [n, r] of Object.entries(state.files)) if (r.id === note.id && n !== name) { await folder.remove(n).catch(() => {}); delete state.files[n]; }
        state.files[name] = { id: note.id, mtime: meta.mtime, size: meta.size, hash: hashText(text) };
        await setVaultState(state);
        return 'written';
    } catch (e) { console.warn('vault write failed', e); await setVaultStatus({ result: 'error', error: e.message }); return 'error'; }
}

async function vaultRemove(id) {
    const state = await vaultState();
    const entry = Object.entries(state.files).find(([, r]) => r.id === id);
    if (!entry) return;
    const { status, folder } = await vaultFolder();
    if (status === 'ok') await folder.remove(entry[0]).catch(() => {});
    // with no access the record stays, and the next sync removes the file
    if (status === 'ok') { delete state.files[entry[0]]; await setVaultState(state); }
}

// The two-way reconciliation, serialised so an alarm and a click cannot overlap.
// Tests pass an in-memory folder in args.folder and get it back.
let syncing = null;
function syncVault(args = {}) {
    if (syncing) return syncing;
    syncing = (async () => {
        const seam = args.folder ? memoryFolder(args.folder.files || {}) : null;
        let folder = seam, status = 'ok';
        if (!seam) ({ status, folder } = await vaultFolder());
        if (status !== 'ok') { await setVaultStatus({ result: status, at: new Date().toISOString() }); return { status, report: null }; }
        const store = { allNotes, putNote, deleteNote: async (id) => { await deleteNote(id); await chrome.alarms.clear(`remind:${id}`); } };
        try {
            const { state, report } = await syncFolder(folder, store, seam ? (args.state || emptyState()) : await vaultState());
            if (!seam) await setVaultState(state);
            await setVaultStatus({ result: 'ok', at: new Date().toISOString(), report, error: null });
            if (report.imported || report.updated || report.deletedLocal) { await rearmReminders(); scheduleBadgeForAll(); }
            return { status: 'ok', report, ...(seam ? { folder: seam.files, state } : {}) };
        } catch (e) {
            await setVaultStatus({ result: 'error', at: new Date().toISOString(), error: e.message });
            return { status: 'error', error: e.message, report: null };
        }
    })().finally(() => { syncing = null; });
    return syncing;
}

// A look at the current page is a good moment to catch up, at most once a minute.
async function maybeSyncVault() {
    try {
        const { settings } = await loadSettings();
        if (!settings.writeToVault) return;
        const st = await vaultStatus();
        if (st.at && Date.now() - new Date(st.at).getTime() < 60000) return;
        syncVault({ reason: 'view' }).catch(() => {});
    } catch (e) { /* ignore */ }
}

async function scheduleVaultSync() {
    try { await chrome.alarms.create(SYNC_ALARM, { periodInMinutes: SYNC_PERIOD_MINUTES }); } catch (e) { /* ignore */ }
}

// ----- links --------------------

// The index rows for a note's links, by key. A link whose page was deleted or
// never imported is kept (the key still says what it was) and marked missing.
async function linkedRows(note) {
    const keys = note?.links || [];
    if (!keys.length) return [];
    const index = await getIndex();
    return keys.map((key) => index[noteId(key)] || { id: noteId(key), key, title: key, host: '', url: '', missing: true });
}

// The note named by args.id, or the (possibly new) note for args.url / the
// tab: linking a page the user has not written on yet creates its note.
async function noteFor(args) {
    if (args.id) {
        const note = await getNote(args.id);
        if (!note) throw new Error('Note not found');
        return note;
    }
    const tab = await tabFor(args);
    const url = args.url || tab?.url;
    if (!url || !/^(https?|file):/.test(url)) throw new Error('No page to link');
    const { ident, note } = await noteForUrl(url);
    return note || newNote({ url, title: args.title || tab?.title || url, key: ident.key, rule: ident.rule });
}

// ----- messages --------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handle(message)
        .then((result) => sendResponse({ ok: true, result }))
        .catch((error) => { console.error(message, error); sendResponse({ ok: false, error: error.message || String(error) }); });
    return true;
});

async function handle({ type, args = {} } = {}) {
    await storageReady;
    switch (type) {
        case 'openNote': {
            const note = await getNote(args.id);
            if (!note) throw new Error('Note not found');
            const url = args.page ? note.url : chrome.runtime.getURL(`src/note.html?id=${note.id}`);
            if (args.page && !/^(https?|file):/i.test(url)) throw new Error('This page cannot be opened.');
            const tab = await chrome.tabs.create({ url });
            return { tabId: tab.id };
        }
        case 'stickyVisibility': {
            if (typeof args.visible === 'boolean') {
                await chrome.storage.local.set({ [VISIBILITY_KEY]: args.visible });
                await Promise.all((await chrome.tabs.query({})).map((t) => chrome.tabs.sendMessage(t.id, { type: 'pn:visibility', visible: args.visible }).catch(() => {})));
            }
            return { visible: await stickyVisibility() };
        }
        case 'current': {
            const tab = await tabFor(args);
            if (args.capture !== false) maybeSyncVault();
            if (!tab || !tab.url) return { tab: null, note: null, vault: await vaultStatus() };
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
            return { tab: { id: tab.id, url: tab.url, title: tab.title, favIconUrl: tab.favIconUrl || '' }, ident, note: note ? stripForPopup(note) : null, insights: note ? insightsFor(note) : null, today: note ? todayIndex(note) : -1, linked: await linkedRows(note), vault: await vaultStatus(), stickiesVisible: await stickyVisibility(), alwaysShow: /^https?:/.test(tab.url) ? await alwaysShowState(tab.url) : null };
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
        // ----- stickies: notes attached to elements on the page -----
        case 'stickies': {
            const { note } = await noteForUrl(args.url);
            return note?.stickies || [];
        }
        case 'stickyAdd': {
            const { ident, note, settings } = await noteForUrl(args.url);
            const base = note || newNote({ url: args.url, title: args.title || args.url, key: ident.key, rule: ident.rule });
            const next = addSticky(base, { anchor: args.anchor, text: args.text || '' });
            const saved = await persist(next, settings);
            notifyLayers(args.url);
            return saved.stickies[saved.stickies.length - 1];
        }
        case 'stickyUpdate': {
            const { note, settings } = await noteForUrl(args.url);
            if (!note) throw new Error('Note not found');
            const next = updateSticky(note, args.id, { text: args.text });
            if (next !== note) await persist(next, settings);
            return true;
        }
        case 'stickyRemove': {
            const { note, settings } = await noteForUrl(args.url);
            if (!note) throw new Error('Note not found');
            const next = removeSticky(note, args.id);
            if (next !== note) await persist(next, settings);
            notifyLayers(args.url);
            return true;
        }
        case 'stickyPlacement': {
            // the layer reports which stickies it could place, so lists can show orphans
            const { note } = await noteForUrl(args.url);
            if (!note) return true;
            let next = note;
            for (const p of args.placement || []) next = updateSticky(next, p.id, { found: p.found });
            if (next !== note) await putNote(next);
            return true;
        }
        case 'feedback': {
            const note = await getNote(args.id);
            if (!note) throw new Error('Note not found');
            return feedbackMarkdown(note);
        }
        case 'annotate': {
            // inject the layer into the tab (activeTab grant from the user's click)
            // and optionally start pick mode
            const tab = await tabFor(args);
            if (!tab?.id || !/^https?:/.test(tab.url || '')) throw new Error('Stickies work on web pages only.');
            await ensureLayer(tab.id);
            if (args.pick) await chrome.tabs.sendMessage(tab.id, { type: 'pn:pick' });
            if (args.scrollTo) await chrome.tabs.sendMessage(tab.id, { type: 'pn:scrollTo', id: args.scrollTo });
            return true;
        }
        case 'alwaysShow': {
            // per-site opt-in: register the layer to load on that origin
            const origin = new URL(args.url).origin;
            if (args.enable) {
                const granted = await chrome.permissions.contains({ origins: [`${origin}/*`] });
                if (!granted) throw new Error('Permission was not granted.');
                await chrome.scripting.registerContentScripts([{ id: `layer:${origin}`, matches: [`${origin}/*`], js: ['src/content/annotate.js'], runAt: 'document_idle' }]).catch(async () => {
                    await chrome.scripting.updateContentScripts([{ id: `layer:${origin}`, matches: [`${origin}/*`], js: ['src/content/annotate.js'], runAt: 'document_idle' }]);
                });
            } else {
                await chrome.scripting.unregisterContentScripts({ ids: [`layer:${origin}`] }).catch(() => {});
                await chrome.permissions.remove({ origins: [`${origin}/*`] }).catch(() => {});
            }
            return alwaysShowState(args.url);
        }
        case 'alwaysShowState':
            return alwaysShowState(args.url);
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
        case 'link': {
            // args: { id | url | tabId } and { otherId }; symmetric, both notes saved
            const [a, other] = await Promise.all([noteFor(args), getNote(args.otherId)]);
            if (!other) throw new Error('That page has no note to link to');
            const { settings } = await ctx();
            const [a2, b2] = linkNotes(a, other);
            const saved = (await persist(a2, settings)) || a2;
            if (b2 !== other) await persist(b2, settings);
            return { note: stripForPopup(saved), linked: await linkedRows(saved) };
        }
        case 'unlink': {
            const a = await getNote(args.id);
            if (!a) throw new Error('Note not found');
            const other = await getNote(args.otherId);
            const { settings } = await ctx();
            // the other side may be gone: drop the dangling key by itself
            const [a2, b2] = other ? unlinkNotes(a, other) : [{ ...a, links: (a.links || []).filter((k) => noteId(k) !== args.otherId) }, null];
            const saved = (await persist(a2, settings)) || a2;
            if (b2 && b2 !== other) await persist(b2, settings);
            return { note: stripForPopup(saved), linked: await linkedRows(saved) };
        }
        case 'links':
            return linkedRows(await getNote(args.id));
        case 'deleteNote': {
            // the pages it was linked to forget it
            const gone = await getNote(args.id);
            if (gone?.links?.length) {
                const { settings } = await ctx();
                for (const key of gone.links) {
                    const other = await getNote(noteId(key));
                    if (other) await persist(unlinkNotes(other, gone)[0], settings);
                }
            }
            await deleteNote(args.id);
            await vaultRemove(args.id);
            await chrome.alarms.clear(`remind:${args.id}`);
            scheduleBadgeForAll();
            return true;
        }
        case 'get':
            return getNote(args.id);
        case 'list': {
            const index = await getIndex();
            let rows = Object.values(index);
            if (!args.includeCaptures) rows = rows.filter((r) => r.entries > 0 || r.remind || r.stickies > 0);
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
        case 'writeAllToVault':
        case 'syncVault': {
            const r = await syncVault(args);
            return { ...r, written: r.report?.written || 0, total: (await getIndex() && Object.keys(await getIndex()).length) };
        }
        case 'vaultStatus':
            return { ...(await vaultStatus()), connected: (await vaultFolder()).status !== 'no-vault' };
        case 'shareExport': {
            // one page's stickies (and notes if asked) as a flat text file, no server
            const note = await getNote(args.id);
            if (!note) throw new Error('Note not found');
            const payload = sharePayload(note, { includeEntries: !!args.includeEntries });
            if (!payload.stickies.length && !payload.entries?.length) throw new Error('Nothing to share on this page yet.');
            return { text: await encodeShare(payload, { passphrase: args.passphrase || '' }), fileName: shareFileName(note), stickies: payload.stickies.length, entries: payload.entries?.length || 0 };
        }
        case 'shareImport': {
            // received stickies land on the recipient's note for that page,
            // by the recipient's own identity rules
            const payload = await decodeShare(args.text || '', { passphrase: args.passphrase || '' });
            const { ident, note, settings } = await noteForUrl(payload.url);
            const base = note || newNote({ url: payload.url, title: payload.title || payload.url, key: ident.key, rule: ident.rule });
            const { note: next, addedStickies, addedEntries } = applyShare(base, payload);
            const saved = next !== base ? await persist(next, settings) : base;
            if (next !== base) await notifyLayers(payload.url);
            const current = args.url ? identify(args.url, (await ctx()).compiled, settings.normalization).id === ident.id : null;
            return { id: saved?.id || base.id, title: saved?.title || base.title, url: payload.url, addedStickies, addedEntries, samePage: current };
        }
        case 'widgetLayout': {
            // where the user left the floating button and its window; one
            // local preference shared by every page
            if (args.layout && typeof args.layout === 'object') {
                const prev = (await chrome.storage.local.get(WIDGET_KEY))[WIDGET_KEY] || {};
                await chrome.storage.local.set({ [WIDGET_KEY]: { ...prev, ...args.layout } });
            }
            return (await chrome.storage.local.get(WIDGET_KEY))[WIDGET_KEY] || {};
        }
        case 'settingsChanged':
            scheduleBadgeForAll();
            await applyLaunchMode();
            return true;
        default:
            throw new Error(`Unknown message type ${type}`);
    }
}

// ----- in-page layer --------------------

async function layerPresent(tabId) {
    try { const r = await chrome.tabs.sendMessage(tabId, { type: 'pn:ping' }); return !!r?.ok; } catch (e) { return false; }
}

async function ensureLayer(tabId) {
    if (await layerPresent(tabId)) return;
    await chrome.scripting.executeScript({ target: { tabId }, files: ['src/content/annotate.js'] });
    for (let i = 0; i < 30; i++) { if (await layerPresent(tabId)) return; await new Promise((r) => setTimeout(r, 100)); }
    throw new Error('The page did not accept the notes layer.');
}

// tell every tab on this page to re-read its stickies (no-op where the layer is absent)
async function notifyLayers(url) {
    try {
        const { ident, settings } = await noteForUrl(url);
        const c = await ctx();
        for (const t of await chrome.tabs.query({})) {
            if (!t.url) continue;
            if (identify(t.url, c.compiled, settings.normalization).key !== ident.key) continue;
            chrome.tabs.sendMessage(t.id, { type: 'pn:refresh' }).catch(() => {});
        }
    } catch (e) { /* ignore */ }
}

async function alwaysShowState(url) {
    try {
        const origin = new URL(url).origin;
        const scripts = await chrome.scripting.getRegisteredContentScripts({ ids: [`layer:${origin}`] }).catch(() => []);
        return { origin, enabled: scripts.length > 0 };
    } catch (e) { return { origin: '', enabled: false }; }
}

// ----- presence badge --------------------

const badgeTimers = new Map();
let allBadgeTimer = null;

// Badges come from the index (canonical key -> entry count), so a pass over
// every tab costs one settings load, one rule compile and one index read.
async function badgeContext() {
    await storageReady;
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
        const count = (row?.entries || 0) + (row?.stickies || 0);
        await chrome.action.setBadgeBackgroundColor({ tabId: tab.id, color: count ? '#c73b3b' : '#6c7189' });
        await chrome.action.setBadgeTextColor({ tabId: tab.id, color: '#ffffff' });
        await chrome.action.setBadgeText({ tabId: tab.id, text: count ? String(count) : row ? '●' : '' });
        await chrome.action.setTitle({ tabId: tab.id, title: count ? `${APP_NAME}: ${count} saved note${count === 1 ? '' : 's'} on this page` : row ? `${APP_NAME}: saved capture` : APP_NAME });
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
    if (alarm.name === SYNC_ALARM) { syncVault({ reason: 'alarm' }).catch(() => {}); return; }
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
// With no popup set, the icon click reaches us. It is the moment we may read
// the page (activeTab): capture it, then show the note the way the user chose.
// The mode is cached so the side panel can open synchronously: that call only
// works inside the click's gesture, which an awaited storage read can spend.
chrome.action.onClicked.addListener((tab) => {
    if (!tab?.id) return;
    const web = /^https?:/.test(tab.url || '');
    if (launchMode === 'floating' && !web) {
        // browser and extension pages cannot host the layer: the panel instead
        chrome.sidePanel.open({ windowId: tab.windowId }).catch((e) => console.error(e));
        return;
    }
    (async () => {
        try {
            if (!web) return;
            await handle({ type: 'current', args: { tabId: tab.id } });
            if (launchMode !== 'floating') return;
            await ensureLayer(tab.id);
            await chrome.tabs.sendMessage(tab.id, { type: 'pn:widget', toggle: true });
        } catch (e) {
            console.error('launch failed', e);
            chrome.action.setBadgeText({ tabId: tab.id, text: '!' }).catch(() => {});
            chrome.action.setTitle({ tabId: tab.id, title: `${chrome.runtime.getManifest().name}: could not open here (${e.message})` }).catch(() => {});
        }
    })();
});
chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command === 'snoozeTab') {
        try { await handle({ type: 'snoozeTab', args: { tabId: tab?.id, preset: 'tomorrow' } }); } catch (e) { console.error(e); }
    }
});

// ----- launch mode --------------------

// The toolbar icon opens a popup, toggles the side panel, or (with no popup
// and no panel behaviour) reaches onClicked, which puts the widget on the
// page. The popup must be cleared for the other two modes: a popup takes the
// click before anything else sees it.
let launchMode = 'popup';
async function applyLaunchMode() {
    const { settings } = await loadSettings();
    const mode = launchMode = settings.launch;
    try { await chrome.action.setPopup({ popup: mode === 'popup' ? 'src/popup.html' : '' }); } catch (e) { /* ignore */ }
    try { await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: mode === 'sidebar' }); } catch (e) { /* older browsers */ }
}

// ----- lifecycle --------------------

chrome.runtime.onInstalled.addListener(async (details) => {
    await rebuildMenus();
    await rearmReminders();
    await applyLaunchMode();
    await scheduleVaultSync();
    scheduleBadgeForAll();
    if (details.reason === 'install') chrome.runtime.openOptionsPage();
});
chrome.runtime.onStartup.addListener(() => { rebuildMenus(); rearmReminders(); applyLaunchMode(); scheduleVaultSync(); scheduleBadgeForAll(); syncVault({ reason: 'startup' }).catch(() => {}); });
scheduleBadgeForAll();
// the worker restarts often: warm the launch mode so the icon click can act at once
applyLaunchMode();
