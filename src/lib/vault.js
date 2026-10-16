// Two-way vault sync: the Markdown files in the vault folder are the shared
// truth between browser profiles; this module reconciles one profile's notes
// with them. Pure: the folder and the note store come in as adapters, so the
// same code runs over a real FileSystemDirectoryHandle and over an in-memory
// folder in tests.
//
//   folder: { list() -> [{ name, mtime, size }], read(name) -> text,
//             write(name, text) -> { mtime, size }, remove(name) }
//   store:  { allNotes() -> [note], putNote(note) -> note|null, deleteNote(id) }
//   state:  { files: { [name]: { id, mtime, size, hash } } }  (per profile)
//
// Fast by design: the scan reads only file metadata; a file's text is read
// when its mtime or size changed, and compared by hash before parsing, since
// cloud drives touch mtimes without changing content. Nothing is written when
// a file already equals the note's serialization, so two profiles converge
// instead of ping-ponging.

import { fileNameFor, fromMarkdown, mergeNotes, toMarkdown } from './notes.js';

export const SYNC_ALARM = 'vault:sync';
export const SYNC_PERIOD_MINUTES = 5;
export const STATE_KEY = 'vault:state';
export const STATUS_KEY = 'vault:status';

// FNV-1a, 32-bit, hex: cheap and good enough to tell "same text" apart.
export function hashText(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(16).padStart(8, '0');
}

export function emptyState() { return { files: {} }; }

// A note with nothing a person wrote is not worth a file.
export function worthAFile(note) {
    return !!(note.entries?.length || note.stickies?.length || note.links?.length || note.remind);
}

const recordFor = (state, id) => Object.entries(state.files).find(([, r]) => r.id === id);

export async function syncFolder(folder, store, state = emptyState(), { now = new Date() } = {}) {
    state = { files: { ...(state?.files || {}) } };
    const report = { scanned: 0, read: 0, imported: 0, updated: 0, written: 0, deletedLocal: 0, deletedFiles: 0, errors: [] };
    const files = (await folder.list()).filter((f) => f.name.endsWith('.md'));
    report.scanned = files.length;
    const notes = new Map((await store.allNotes()).map((n) => [n.id, n]));
    const seen = new Set();

    // Write a note's serialization under its current name, retiring the old
    // name if the title moved it, and record what the folder now holds.
    async function writeBack(note, text, fromName) {
        const name = fileNameFor(note);
        const meta = await folder.write(name, text);
        report.written++;
        if (fromName && fromName !== name) { await folder.remove(fromName).catch(() => {}); delete state.files[fromName]; }
        state.files[name] = { id: note.id, mtime: meta.mtime, size: meta.size, hash: hashText(text) };
    }

    for (const file of files) {
        const rec = state.files[file.name];
        try {
            // A file we synced before, for a note this profile no longer has:
            // the note was deleted here. The file goes.
            if (rec && !notes.has(rec.id)) {
                await folder.remove(file.name);
                delete state.files[file.name];
                report.deletedFiles++;
                continue;
            }
            if (rec && rec.mtime === file.mtime && rec.size === file.size) {
                // the file is as we left it; this profile may have changed the
                // note since (a save while the vault was unreachable)
                seen.add(rec.id);
                const local = notes.get(rec.id);
                const canonical = toMarkdown(local);
                if (hashText(canonical) !== rec.hash) await writeBack(local, canonical, file.name);
                continue;
            }
            const text = await folder.read(file.name);
            report.read++;
            const hash = hashText(text);
            if (rec && rec.hash === hash) { state.files[file.name] = { ...rec, mtime: file.mtime, size: file.size }; seen.add(rec.id); continue; }
            let incoming;
            try { incoming = fromMarkdown(text); } catch (e) { report.errors.push(`${file.name}: ${e.message}`); continue; }
            seen.add(incoming.id);
            const existing = notes.get(incoming.id) || null;
            let note = existing ? mergeNotes(existing, incoming, now) : incoming;
            if (!existing || toMarkdown(note) !== toMarkdown(existing)) {
                note = (await store.putNote(note)) || note;
                notes.set(note.id, note);
                existing ? report.updated++ : report.imported++;
            } else note = existing;
            // The file lacks what this profile has: write the union back, under
            // the note's current file name.
            const canonical = toMarkdown(note);
            if (canonical !== text || fileNameFor(note) !== file.name) await writeBack(note, canonical, file.name);
            else state.files[file.name] = { id: note.id, mtime: file.mtime, size: file.size, hash };
        } catch (e) {
            report.errors.push(`${file.name}: ${e.message}`);
        }
    }

    // Notes without a file: new here, so write them; or synced before and the
    // file is gone, so another profile deleted them.
    const present = new Set(files.map((f) => f.name));
    for (const note of notes.values()) {
        if (seen.has(note.id)) continue;
        const rec = recordFor(state, note.id);
        try {
            if (rec && !present.has(rec[0])) {
                await store.deleteNote(note.id);
                delete state.files[rec[0]];
                report.deletedLocal++;
            } else if (!rec && worthAFile(note)) {
                await writeBack(note, toMarkdown(note), null);
            }
        } catch (e) {
            report.errors.push(`${fileNameFor(note)}: ${e.message}`);
        }
    }
    // records for files that are gone and notes that are gone: forget them
    for (const [name, rec] of Object.entries(state.files)) if (!present.has(name) && !notes.has(rec.id)) delete state.files[name];
    return { state, report };
}

// An in-memory folder: tests, and the e2e seam (`args.folder`).
export function memoryFolder(files = {}, clock = () => Date.now()) {
    const store = { ...files };
    return {
        files: store,
        async list() { return Object.entries(store).map(([name, f]) => ({ name, mtime: f.mtime, size: f.text.length })); },
        async read(name) { if (!store[name]) throw new Error('No such file'); return store[name].text; },
        async write(name, text) { const mtime = Math.max(clock(), (store[name]?.mtime || 0) + 1); store[name] = { text, mtime }; return { mtime, size: text.length }; },
        async remove(name) { delete store[name]; }
    };
}

// A folder over a FileSystemDirectoryHandle (extension pages and the worker).
export function handleFolder(handle) {
    return {
        async list() {
            const out = [];
            for await (const [name, h] of handle.entries()) {
                if (h.kind !== 'file' || !name.endsWith('.md')) continue;
                const f = await h.getFile();
                out.push({ name, mtime: f.lastModified, size: f.size });
            }
            return out;
        },
        async read(name) { return (await (await handle.getFileHandle(name)).getFile()).text(); },
        async write(name, text) {
            const fh = await handle.getFileHandle(name, { create: true });
            const w = await fh.createWritable();
            await w.write(text);
            await w.close();
            const f = await fh.getFile();
            return { mtime: f.lastModified, size: f.size };
        },
        async remove(name) { await handle.removeEntry(name); }
    };
}
