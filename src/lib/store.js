// Notes live in chrome.storage.local (sync is capped at 100 KB total, far too
// small for a notes habit). One item per note plus a small index for lists.
// Settings are in settings.js (sync).

import { handleFolder } from './vault.js';
import { indexEntry, sanitizeSavedTitle } from './notes.js';

const INDEX_KEY = 'notes:index';
const noteKey = (id) => `note:${id}`;

// The index is one item that several handlers (popup, alarms, context menu)
// read-modify-write; serialise those writes so none are lost.
let chain = Promise.resolve();
function serialized(fn) {
    const run = chain.then(fn, fn);
    chain = run.catch(() => {});
    return run;
}

export async function getNote(id) {
    const data = await chrome.storage.local.get(noteKey(id));
    return data[noteKey(id)] || null;
}

export async function getIndex() {
    const data = await chrome.storage.local.get(INDEX_KEY);
    return data[INDEX_KEY] || {};
}

export function putNote(note) {
    return serialized(() => putNoteNow(note));
}

export function deleteNote(id) {
    return serialized(() => deleteNoteNow(id));
}

export function migrateNoteTitles() {
    return serialized(async () => {
        const marker = 'migration:linkedin-titles:1';
        if ((await chrome.storage.local.get(marker))[marker]) return;
        const data = await chrome.storage.local.get(null);
        const index = { ...(data[INDEX_KEY] || {}) };
        const changes = {};
        for (const [key, note] of Object.entries(data)) {
            if (!key.startsWith('note:') || !note?.id) continue;
            const next = sanitizeSavedTitle(note);
            if (next === note) continue;
            changes[key] = next;
            index[note.id] = indexEntry(next);
        }
        await chrome.storage.local.set({ ...changes, [INDEX_KEY]: index, [marker]: true });
    });
}

async function putNoteNow(note) {
    const index = await getIndex();
    if (note.entries.length === 0 && !note.remind && !(note.snapshots && note.snapshots.length) && !(note.stickies && note.stickies.length) && !(note.links && note.links.length)) {
        // a note with no entries, reminder, captures, stickies or links is a deleted note
        delete index[note.id];
        await chrome.storage.local.remove(noteKey(note.id));
        await chrome.storage.local.set({ [INDEX_KEY]: index });
        return null;
    }
    index[note.id] = indexEntry(note);
    await chrome.storage.local.set({ [noteKey(note.id)]: note, [INDEX_KEY]: index });
    return note;
}

async function deleteNoteNow(id) {
    const index = await getIndex();
    delete index[id];
    await chrome.storage.local.remove(noteKey(id));
    await chrome.storage.local.set({ [INDEX_KEY]: index });
}

export async function allNotes() {
    const index = await getIndex();
    const ids = Object.keys(index);
    if (ids.length === 0) return [];
    const data = await chrome.storage.local.get(ids.map(noteKey));
    return ids.map((id) => data[noteKey(id)]).filter(Boolean);
}

// Rebuilds the index from the notes themselves (after import, or if it drifts).
export async function rebuildIndex() {
    const all = await chrome.storage.local.get(null);
    const index = {};
    for (const [k, v] of Object.entries(all)) {
        if (k.startsWith('note:') && v && v.id) index[v.id] = indexEntry(v);
    }
    await chrome.storage.local.set({ [INDEX_KEY]: index });
    return index;
}

// ----- Obsidian vault handle (File System Access API) ---------------------
// The directory handle is stored in IndexedDB; it is usable from the service
// worker once the user has granted permission from the options page.

const DB = 'page-notes';
const STORE = 'handles';

function openDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function saveVaultHandle(handle) {
    const db = await openDb();
    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(handle, 'vault');
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

export async function loadVaultHandle() {
    try {
        const db = await openDb();
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readonly');
            const req = tx.objectStore(STORE).get('vault');
            req.onsuccess = () => resolve(req.result || null);
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        return null;
    }
}

export async function clearVaultHandle() {
    const db = await openDb();
    await new Promise((resolve) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete('vault');
        tx.oncomplete = resolve;
    });
}

// The vault folder as a sync adapter (see vault.js), if we hold permission.
// status: 'ok' | 'no-vault' | 'no-permission' | 'error'.
export async function vaultFolder() {
    const handle = await loadVaultHandle();
    if (!handle) return { status: 'no-vault', folder: null };
    try {
        if ((await handle.queryPermission({ mode: 'readwrite' })) !== 'granted') return { status: 'no-permission', folder: null };
        return { status: 'ok', folder: handleFolder(handle) };
    } catch (e) {
        console.warn('vault unavailable', e);
        return { status: 'error', folder: null };
    }
}
