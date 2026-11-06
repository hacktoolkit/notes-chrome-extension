import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchRows } from '../src/lib/picker.js';

const rows = [
    { id: 'gh', title: 'jontsai (Jonathan Tsai) · GitHub', host: 'github.com', url: 'https://github.com/jontsai', preview: 'my profile', updated: '2026-10-01T00:00:00.000Z' },
    { id: 'li', title: '(2) Jonathan Tsai | LinkedIn', host: 'linkedin.com', url: 'https://www.linkedin.com/in/jontsai/', preview: 'screening', updated: '2026-10-02T00:00:00.000Z' },
    { id: 'pr', title: 'Fix the thing by jontsai · Pull Request #4', host: 'github.com', url: 'https://github.com/dataro/app/pull/4', preview: 'waiting on CI', updated: '2026-10-03T00:00:00.000Z' }
];

test('matchRows filters by every word across title, site, url and preview, excludes ids, ranks title hits first', () => {
    assert.deepEqual(matchRows(rows, '').map((r) => r.id), ['pr', 'li', 'gh'], 'empty query lists everything, newest first');
    assert.deepEqual(matchRows(rows, 'linkedin').map((r) => r.id), ['li']);
    assert.deepEqual(matchRows(rows, 'jontsai github').map((r) => r.id), ['gh', 'pr'], 'all words must match somewhere; both in the title ranks first');
    assert.deepEqual(matchRows(rows, 'profile').map((r) => r.id), ['gh'], 'the latest note text counts');
    assert.deepEqual(matchRows(rows, 'dataro').map((r) => r.id), ['pr'], 'the url is searchable');
    assert.deepEqual(matchRows(rows, 'jonathan').map((r) => r.id), ['li', 'gh'], 'newest first among equal title hits');
    assert.deepEqual(matchRows(rows, 'tsai', { exclude: new Set(['li', 'pr']) }).map((r) => r.id), ['gh']);
    assert.deepEqual(matchRows(rows, 'nothing here'), []);
    assert.deepEqual(matchRows(rows, '(2)').map((r) => r.id), [], 'unread counters are not searchable text');
});
