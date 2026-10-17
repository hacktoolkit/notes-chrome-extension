import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crc32, makeZip } from '../src/lib/zip.js';

test('crc32 matches the known value for "123456789"', () => {
    assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926);
});

test('makeZip produces a valid stored archive', () => {
    const zip = makeZip([{ name: 'a.md', text: 'hello' }, { name: 'dir/b.md', text: 'wörld' }], new Date('2026-10-11T10:00:00'));
    const view = new DataView(zip.buffer);
    assert.equal(view.getUint32(0, true), 0x04034b50); // local header
    assert.equal(view.getUint32(zip.length - 22, true), 0x06054b50); // end of central directory
    assert.equal(view.getUint16(zip.length - 22 + 10, true), 2); // entries
    const text = new TextDecoder().decode(zip);
    assert.ok(text.includes('a.md') && text.includes('dir/b.md') && text.includes('hello'));
});
