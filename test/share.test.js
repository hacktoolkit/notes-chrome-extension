import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addEntry, addSticky, newNote } from '../src/lib/notes.js';
import { SHARE_BEGIN, SHARE_END, applyShare, decodeShare, encodeShare, inspectShare, shareFileName, sharePayload } from '../src/lib/share.js';

const page = () => {
    let n = newNote({ url: 'https://example.com/pricing', title: 'Pricing – Site', key: 'https://example.com/pricing' });
    n = addSticky(n, { anchor: { css: '#pricing > p', quote: { exact: 'Plans start at $9', prefix: '', suffix: '' } }, text: 'Lead with annual.' });
    n = addEntry(n, 'Private note, not shared by default.');
    return n;
};

test('payload carries stickies, and entries only when asked', () => {
    const p = sharePayload(page());
    assert.equal(p.v, 1);
    assert.equal(p.stickies.length, 1);
    assert.equal(p.entries, undefined);
    assert.equal(sharePayload(page(), { includeEntries: true }).entries.length, 1);
    assert.equal(shareFileName(page()), 'pricing-site-stickies.pagenotes.txt');
});

test('encode/decode round-trips, compressed, wrapped, unencrypted', async () => {
    const p = sharePayload(page());
    const text = await encodeShare(p);
    assert.ok(text.startsWith(SHARE_BEGIN + '\n'));
    assert.ok(text.trimEnd().endsWith(SHARE_END));
    assert.deepEqual(inspectShare(text) && [inspectShare(text).version, inspectShare(text).compression, inspectShare(text).cipher], [1, 'deflate', 'none']);
    assert.ok(text.split('\n').every((l) => l.length <= 76));
    assert.deepEqual(await decodeShare(text), p);
    // tolerant of the whitespace email adds
    assert.deepEqual(await decodeShare(`\n  ${text.replace(/\n/g, '\r\n')}  \n`), p);
    assert.ok(!text.includes('Lead with annual'), 'the body is not plain text');
});

test('a passphrase encrypts; the wrong one or none fails cleanly', async () => {
    const p = sharePayload(page(), { includeEntries: true });
    const text = await encodeShare(p, { passphrase: 'correct horse' });
    assert.equal(inspectShare(text).cipher, 'aes-gcm');
    assert.deepEqual(await decodeShare(text, { passphrase: 'correct horse' }), p);
    await assert.rejects(decodeShare(text), /encrypted/);
    await assert.rejects(decodeShare(text, { passphrase: 'wrong' }), /Wrong passphrase/);
    const other = await encodeShare(p, { passphrase: 'correct horse' });
    assert.notEqual(other, text, 'fresh salt and iv every time');
});

test('damaged or foreign text is rejected', async () => {
    await assert.rejects(decodeShare('hello'), /not a Page Notes share/);
    const text = await encodeShare(sharePayload(page()));
    const lines = text.split('\n');
    lines[2] = lines[2].slice(0, -8) + 'AAAAAAAA';
    await assert.rejects(decodeShare(lines.join('\n')), /damaged/);
    await assert.rejects(decodeShare(text.replace('pagenotes/1', 'pagenotes/9')), /newer version/);
});

test('applyShare merges stickies by id and entries by time and text, never overwriting', () => {
    const mine = page();
    const payload = sharePayload(mine, { includeEntries: true });
    payload.stickies.push({ id: 'theirs', anchor: { quote: { exact: 'Pricing', prefix: '', suffix: '' } }, text: 'Their comment' });
    payload.entries.push({ at: '2026-10-16T09:00:00.000Z', text: 'Their entry' });
    const r = applyShare(mine, payload);
    assert.equal(r.addedStickies, 1, 'the sticky with my own id is not duplicated');
    assert.equal(r.addedEntries, 1);
    assert.equal(r.note.stickies.length, 2);
    assert.equal(r.note.entries[0].text, 'Their entry');
    const again = applyShare(r.note, payload);
    assert.equal(again.note, r.note, 'idempotent');
});
