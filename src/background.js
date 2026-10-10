// Service worker: owns every operation. The popup and options page only send
// messages. Presence badge, reminders, snoozed tabs, context menu capture.

import { loadSettings } from './lib/settings.js';
import { compileRules } from './lib/url.js';
import {
    addEntry, fileNameFor, fromMarkdown, identify, mergeNotes, matchesQuery, newNote,
    presetTime, removeEntry, setReminder, setSnapshot, toMarkdown, updateEntry
} from './lib/notes.js';
import { allNotes, deleteNote, getIndex, getNote, putNote, rebuildIndex, writeToVault } from './lib/store.js';
import { makeZip } from './lib/zip.js';

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

// Page snapshot via activeTab: title, description, selection, leading text.
async function captureSnapshot(tabId) {
    try {
        const [r] = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => ({
                title: document.title,
                description: document.querySelector('meta[name="description"]')?.content || '',
                selection: String(window.getSelection() || '').slice(0, 2000),
                text: (document.body?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 4000)
            })
        });
        return r?.result || null;
    } catch (e) {
        return null; // no activeTab grant (no user gesture), chrome:// page, etc.
    }
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
            const { ident, note } = await noteForUrl(tab.url);
            return { tab: { id: tab.id, url: tab.url, title: tab.title }, ident, note };
        }
        case 'addEntry': {
            const tab = await tabFor(args);
            const url = args.url || tab?.url;
            if (!url) throw new Error('No page to attach the note to');
            const { ident, note, settings } = await noteForUrl(url);
            let next = note || newNote({ url, title: args.title || tab?.title || url, key: ident.key, rule: ident.rule });
            next = addEntry(next, args.text);
            if (settings.snapshotOnSave && tab && !next.snapshot) {
                const snap = await captureSnapshot(tab.id);
                if (snap) next = setSnapshot(next, snap);
            }
            return persist(next, settings);
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
            if (args.text) next = addEntry(next, args.text);
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
            const zip = makeZip(files);
            // base64 so it crosses the message boundary
            let bin = '';
            for (let i = 0; i < zip.length; i += 0x8000) bin += String.fromCharCode.apply(null, zip.subarray(i, i + 0x8000));
            return { count: files.length, base64: btoa(bin) };
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
                    await persist(mergeNotes(existing, incoming), settings);
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

async function updateBadge(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        const { settings } = await loadSettings();
        if (!settings.showBadge || !tab.url) return chrome.action.setBadgeText({ tabId, text: '' });
        const { note } = await noteForUrl(tab.url);
        await chrome.action.setBadgeBackgroundColor({ tabId, color: '#5b6cff' });
        await chrome.action.setBadgeText({ tabId, text: note ? String(note.entries.length || '●') : '' });
        await chrome.action.setTitle({ tabId, title: note ? `${APP_NAME}: ${note.entries.length} entries here` : APP_NAME });
    } catch (e) { /* tab gone */ }
}

function scheduleBadge(tabId) {
    clearTimeout(badgeTimers.get(tabId));
    badgeTimers.set(tabId, setTimeout(() => { badgeTimers.delete(tabId); updateBadge(tabId); }, 300));
}

async function scheduleBadgeForAll() {
    const tabs = await chrome.tabs.query({});
    for (const t of tabs) scheduleBadge(t.id);
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
