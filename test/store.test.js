import { test } from 'node:test';
import assert from 'node:assert/strict';
import { indexEntry, newNote } from '../src/lib/notes.js';
import { migrateNoteTitles, putNote } from '../src/lib/store.js';

test('title migration updates saved notes and index together, preserves dates, and runs once', async () => {
    const legacy = { ...newNote({ url: 'https://www.linkedin.com/in/jane/', title: 'Jane | LinkedIn', key: 'linkedin:jane' }), title: '(3) Jane | LinkedIn' };
    const unrelated = newNote({ url: 'https://example.com/', title: 'Example', key: 'example' });
    const data = { [`note:${legacy.id}`]: legacy, [`note:${unrelated.id}`]: unrelated, 'notes:index': { [legacy.id]: indexEntry(legacy), [unrelated.id]: indexEntry(unrelated) } };
    const writes = [];
    globalThis.chrome = { storage: { local: {
        get: async (key) => structuredClone(key === null ? data : { [key]: data[key] }),
        set: async (values) => { writes.push(values); Object.assign(data, structuredClone(values)); }
    } } };
    try {
        await migrateNoteTitles();
        assert.equal(data[`note:${legacy.id}`].title, 'Jane | LinkedIn');
        assert.equal(data['notes:index'][legacy.id].title, 'Jane | LinkedIn');
        assert.equal(data[`note:${legacy.id}`].updated, legacy.updated);
        assert.deepEqual(data[`note:${unrelated.id}`], unrelated);
        assert.ok(writes[0][`note:${legacy.id}`] && writes[0]['notes:index']);
        await migrateNoteTitles();
        assert.equal(writes.length, 1);
    } finally { delete globalThis.chrome; }
});

test('a note that only holds a link is kept; emptying its links deletes it', async () => {
    const data = {};
    globalThis.chrome = { storage: { local: {
        get: async (key) => structuredClone(key === null ? data : { [key]: data[key] }),
        set: async (values) => { Object.assign(data, structuredClone(values)); },
        remove: async (key) => { delete data[key]; }
    } } };
    try {
        const note = { ...newNote({ url: 'https://example.com/x', title: 'X', key: 'x' }), links: ['linkedin:jane'] };
        assert.ok(await putNote(note));
        assert.equal(data[`note:${note.id}`].links[0], 'linkedin:jane');
        assert.equal(data['notes:index'][note.id].links, 1);
        assert.equal(await putNote({ ...note, links: [] }), null);
        assert.equal(data[`note:${note.id}`], undefined);
    } finally { delete globalThis.chrome; }
});
