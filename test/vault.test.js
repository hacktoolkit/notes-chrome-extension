import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addEntry, addSticky, fileNameFor, fromMarkdown, linkNotes, newNote, toMarkdown } from '../src/lib/notes.js';
import { emptyState, hashText, memoryFolder, syncFolder, worthAFile } from '../src/lib/vault.js';

function memoryStore(notes = []) {
    const map = new Map(notes.map((n) => [n.id, n]));
    return {
        map,
        async allNotes() { return [...map.values()]; },
        async putNote(n) { if (!worthAFile(n) && !(n.snapshots || []).length) { map.delete(n.id); return null; } map.set(n.id, n); return n; },
        async deleteNote(id) { map.delete(id); }
    };
}
let t = 1000;
const clock = () => (t += 1000);
const at = (m) => new Date(2026, 9, 16, 10, m);

test('hashText is stable and distinguishes texts', () => {
    assert.equal(hashText('abc'), hashText('abc'));
    assert.notEqual(hashText('abc'), hashText('abd'));
    assert.match(hashText(''), /^[0-9a-f]{8}$/);
});

test('a profile writes its notes to an empty folder, skipping capture-only notes', async () => {
    const a = addEntry(newNote({ url: 'https://github.com/x/pull/1', title: 'PR', key: 'github:x/pull/1', now: at(0) }), 'Reviewed.', at(1));
    const captureOnly = { ...newNote({ url: 'https://example.com/', title: 'Ex', key: 'ex' }), snapshots: [{ at: 'x', text: 'y' }] };
    const folder = memoryFolder({}, clock);
    const { state, report } = await syncFolder(folder, memoryStore([a, captureOnly]), emptyState());
    assert.deepEqual(Object.keys(folder.files), [fileNameFor(a)]);
    assert.equal(report.written, 1);
    assert.equal(state.files[fileNameFor(a)].id, a.id);
    // the second scan reads nothing and writes nothing
    const again = await syncFolder(folder, memoryStore([a, captureOnly]), state);
    assert.deepEqual([again.report.read, again.report.written, again.report.imported], [0, 0, 0]);
});

test('two profiles converge through the folder without ping-pong', async () => {
    const folder = memoryFolder({}, clock);
    const base = newNote({ url: 'https://github.com/x/pull/1', title: 'PR', key: 'github:x/pull/1', now: at(0) });
    const A = memoryStore([addEntry(base, 'From A', at(1))]);
    const B = memoryStore([]);
    let sA = emptyState(), sB = emptyState();
    ({ state: sA } = await syncFolder(folder, A, sA));
    let r = await syncFolder(folder, B, sB); sB = r.state;
    assert.equal(r.report.imported, 1, 'B imports A\'s note');
    assert.equal(r.report.written, 0, 'an identical file is not rewritten');
    // B adds an entry locally, then syncs: the file gets the union
    const bNote = [...B.map.values()][0];
    B.map.set(bNote.id, addEntry(bNote, 'From B', at(2)));
    r = await syncFolder(folder, B, sB); sB = r.state;
    assert.equal(r.report.written, 1);
    // A picks it up, keeps its own copy, and has nothing to write back
    r = await syncFolder(folder, A, sA); sA = r.state;
    assert.equal(r.report.updated, 1);
    assert.equal(r.report.written, 0);
    const aNote = [...A.map.values()][0];
    assert.deepEqual(aNote.entries.map((e) => e.text), ['From A', 'From B']);
    // steady state: neither side reads or writes
    for (const [S, st] of [[A, sA], [B, sB]]) {
        const q = await syncFolder(folder, S, st);
        assert.deepEqual([q.report.read, q.report.written, q.report.updated, q.report.imported], [0, 0, 0, 0]);
    }
    assert.equal(Object.keys(folder.files).length, 1);
});

test('a touched mtime without a content change is recorded, not re-imported', async () => {
    const folder = memoryFolder({}, clock);
    const a = addEntry(newNote({ url: 'https://e.com/', title: 'E', key: 'e', now: at(0) }), 'x', at(1));
    const S = memoryStore([a]);
    let { state } = await syncFolder(folder, S, emptyState());
    const name = fileNameFor(a);
    folder.files[name].mtime += 5000; // iCloud re-stamped the file
    const r = await syncFolder(folder, S, state);
    assert.deepEqual([r.report.read, r.report.updated, r.report.written], [1, 0, 0]);
    assert.equal(r.state.files[name].mtime, folder.files[name].mtime);
});

test('deletions propagate both ways; a note never synced is left alone', async () => {
    const folder = memoryFolder({}, clock);
    const a = addEntry(newNote({ url: 'https://a.com/', title: 'A', key: 'a', now: at(0) }), 'a', at(1));
    const b = addEntry(newNote({ url: 'https://b.com/', title: 'B', key: 'b', now: at(0) }), 'b', at(1));
    const S1 = memoryStore([a, b]);
    let { state: s1 } = await syncFolder(folder, S1, emptyState());
    const S2 = memoryStore([]);
    let { state: s2 } = await syncFolder(folder, S2, emptyState());
    assert.equal(S2.map.size, 2);
    // profile 1 deletes A locally (the worker removes the file at that moment; here the file lingers)
    S1.map.delete(a.id);
    let r = await syncFolder(folder, S1, s1); s1 = r.state;
    assert.equal(r.report.deletedFiles, 1, 'a synced note gone locally takes its file with it');
    assert.equal(folder.files[fileNameFor(a)], undefined);
    // profile 2 sees the file gone and drops its copy
    r = await syncFolder(folder, S2, s2); s2 = r.state;
    assert.equal(r.report.deletedLocal, 1);
    assert.equal(S2.map.has(a.id), false);
    assert.equal(S2.map.has(b.id), true);
    // a brand-new local note with no file is written, never deleted
    const c = addEntry(newNote({ url: 'https://c.com/', title: 'C', key: 'c', now: at(0) }), 'c', at(1));
    S2.map.set(c.id, c);
    r = await syncFolder(folder, S2, s2);
    assert.equal(r.report.written, 1);
    assert.equal(S2.map.has(c.id), true);
});

test('a renamed title moves the file; stickies and links merge by identity; bad files are reported', async () => {
    const folder = memoryFolder({}, clock);
    const a0 = addEntry(newNote({ url: 'https://a.com/', title: 'Old title', key: 'a', now: at(0) }), 'a', at(1));
    const S = memoryStore([a0]);
    let { state } = await syncFolder(folder, S, emptyState());
    const oldName = fileNameFor(a0);
    // another profile wrote the same note with a new title and a sticky, and linked it
    const other = newNote({ url: 'https://b.com/', title: 'B', key: 'b', now: at(0) });
    let a1 = { ...fromMarkdown(folder.files[oldName].text), title: 'New title', updated: at(5).toISOString() };
    a1 = addSticky(a1, { anchor: { quote: { exact: 'q', prefix: '', suffix: '' } }, text: 'note' }, at(6));
    [a1] = linkNotes(a1, other, at(7));
    folder.files[oldName] = { text: toMarkdown(a1), mtime: clock() };
    folder.files['junk.md'] = { text: 'not a note', mtime: clock() };
    const r = await syncFolder(folder, S, state);
    const merged = S.map.get(a0.id);
    assert.equal(merged.title, 'New title');
    assert.equal(merged.stickies.length, 1);
    assert.deepEqual(merged.links, ['b']);
    assert.equal(folder.files[oldName], undefined, 'the old file name is gone');
    assert.ok(folder.files[fileNameFor(merged)], 'the file follows the title');
    assert.equal(r.report.errors.length, 1);
    assert.match(r.report.errors[0], /junk\.md/);
});
