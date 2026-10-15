import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addEntry, fileNameFor, fromMarkdown, identify, matchesQuery, mergeNotes, newNote, noteId, presetTime, removeEntry, setReminder, toMarkdown, updateEntry } from '../src/lib/notes.js';
import { DEFAULT_RULES, compileRules } from '../src/lib/url.js';

const { compiled } = compileRules(DEFAULT_RULES);

test('identify collapses URL variants to one note id', () => {
    const a = identify('https://github.com/dataro/app/pull/482', compiled, {});
    const b = identify('https://github.com/dataro/app/pull/482/files#diff', compiled, {});
    assert.equal(a.id, b.id);
    assert.equal(a.rule, 'GitHub pull request');
    assert.notEqual(a.id, identify('https://github.com/dataro/app/pull/483', compiled, {}).id);
    assert.match(noteId('x'), /^[0-9a-f]{12}$/);
});

test('entries are dated and ordered; empty text is ignored', () => {
    let n = newNote({ url: 'https://example.com/a', title: 'A', key: 'https://example.com/a', now: new Date('2026-10-11T01:00:00Z') });
    n = addEntry(n, '  ', new Date('2026-10-11T02:00:00Z'));
    assert.equal(n.entries.length, 0);
    n = addEntry(n, 'first', new Date('2026-10-11T02:00:00Z'));
    n = addEntry(n, 'second', new Date('2026-10-12T02:00:00Z'));
    assert.deepEqual(n.entries.map((e) => e.text), ['first', 'second']);
    assert.equal(n.updated, '2026-10-12T02:00:00.000Z');
    n = updateEntry(n, 0, 'first, edited');
    assert.equal(n.entries[0].text, 'first, edited');
    assert.ok(n.entries[0].edited);
    n = removeEntry(n, 1);
    assert.equal(n.entries.length, 1);
    n = setReminder(n, '2026-11-01T09:00:00Z');
    assert.equal(n.remind, '2026-11-01T09:00:00.000Z');
});

test('markdown round-trips with frontmatter and dated sections', () => {
    let n = newNote({ url: 'https://www.linkedin.com/in/jane/', title: 'Jane Doe | LinkedIn', key: 'linkedin:in/jane', rule: 'LinkedIn profile', now: new Date('2026-10-11T01:00:00Z') });
    n = addEntry(n, 'Likes cheese.\nTwo kids, dog named Fluffy.', new Date('2026-10-11T03:02:00Z'));
    n = addEntry(n, '> quoted line\nmet at the meetup', new Date('2026-10-18T22:30:00Z'));
    n = { ...n, tags: ['people', 'sales'], remind: '2026-11-01T09:00:00.000Z', snapshot: { at: n.updated, text: 'Jane Doe - Head of Things at Acme "quoted"' } };
    const md = toMarkdown(n);
    assert.match(md, /^---\ntitle: "Jane Doe \| LinkedIn"\nurl: https:\/\/www\.linkedin\.com\/in\/jane\/\nkey: linkedin:in\/jane\nrule: "LinkedIn profile"\n/);
    assert.match(md, /tags: \[people, sales\]/);
    assert.match(md, /excerpt: "Jane Doe - Head of Things at Acme \\"quoted\\""/);
    // newest entry first in the file
    assert.ok(md.indexOf('met at the meetup') < md.indexOf('Likes cheese'));
    const back = fromMarkdown(md);
    assert.equal(back.id, n.id);
    assert.equal(back.key, n.key);
    assert.equal(back.title, n.title);
    assert.deepEqual(back.tags, ['people', 'sales']);
    assert.equal(back.remind, n.remind);
    assert.deepEqual(back.entries.map((e) => e.text), n.entries.map((e) => e.text));
    // headings are local wall-clock; the parsed timestamp must match to the minute
    assert.equal(Math.abs(new Date(back.entries[0].at) - new Date(n.entries[0].at)) < 60000, true);
    assert.equal(fileNameFor(n), `jane-doe-linkedin-${n.id}.md`);
});

test('fromMarkdown accepts hand-written notes and rejects junk', () => {
    const hand = `---\ntitle: Plain\nurl: https://example.com/x\nkey: https://example.com/x\n---\nJust a paragraph with no heading.\n\n## 2026-10-12\nA dated one.\n`;
    const n = fromMarkdown(hand);
    assert.equal(n.entries.length, 2);
    assert.equal(n.entries[1].text, 'A dated one.');
    assert.throws(() => fromMarkdown('no frontmatter'), /frontmatter/);
    assert.throws(() => fromMarkdown('---\ntitle: x\n---\n'), /url and key/);
});

test('mergeNotes unions entries without duplicates', () => {
    let a = newNote({ url: 'https://e.com/', title: 'E', key: 'https://e.com/', now: new Date('2026-01-01T00:00:00Z') });
    a = addEntry(a, 'one', new Date('2026-01-02T00:00:00Z'));
    let b = addEntry(a, 'two', new Date('2026-01-03T00:00:00Z'));
    b = { ...b, tags: ['t'] };
    const m = mergeNotes(a, b);
    assert.deepEqual(m.entries.map((e) => e.text), ['one', 'two']);
    assert.deepEqual(m.tags, ['t']);
    assert.deepEqual(mergeNotes(null, b), b);
});

test('matchesQuery and presets', () => {
    const n = addEntry(newNote({ url: 'https://e.com/', title: 'Acme plan', key: 'k' }), 'budget for Q4');
    assert.ok(matchesQuery(n, 'acme q4'));
    assert.ok(!matchesQuery(n, 'zebra'));
    const now = new Date('2026-10-11T10:00:00');
    assert.equal(presetTime('1h', now), new Date('2026-10-11T11:00:00').toISOString());
    assert.equal(presetTime('tomorrow', now), new Date('2026-10-12T09:00:00').toISOString());
    assert.equal(new Date(presetTime('nextweek', now)).getDay(), 1);
    assert.equal(presetTime('nope', now), null);
});

test('addSnapshot keeps history, dedupes identical captures, caps length and keeps the first', async () => {
    const { addSnapshot, SNAPSHOT_LIMIT } = await import('../src/lib/notes.js');
    let n = newNote({ url: 'https://e.com/', title: 'E', key: 'k' });
    n = addSnapshot(n, { title: 'E', text: 'v1', meta: { siteName: 'E' } }, new Date('2026-01-01T00:00:00Z'));
    n = addSnapshot(n, { title: 'E', text: 'v1' }, new Date('2026-01-02T00:00:00Z'));
    assert.equal(n.snapshots.length, 1);
    assert.equal(n.snapshots[0].seen, '2026-01-02T00:00:00.000Z');
    assert.equal(n.snapshots[0].at, '2026-01-01T00:00:00.000Z');
    n = addSnapshot(n, { title: 'E', text: 'v2', structured: { kind: 'x' } }, new Date('2026-01-03T00:00:00Z'));
    assert.equal(n.snapshots.length, 2);
    assert.equal(n.snapshot.text, 'v2');
    assert.equal(n.snapshots[1].structured.kind, 'x');
    for (let i = 0; i < SNAPSHOT_LIMIT + 5; i++) n = addSnapshot(n, { title: 'E', text: `v${i + 10}` }, new Date(2026, 1, i + 1));
    assert.equal(n.snapshots.length, SNAPSHOT_LIMIT);
    assert.equal(n.snapshots[0].text, 'v1');
    assert.equal(addSnapshot(n, null), n);
    assert.equal(addSnapshot(n, { text: '' }), n);
});

test('mergeNotes matches entries to the minute and keeps the existing reminder', () => {
    let a = newNote({ url: 'https://e.com/', title: 'E', key: 'https://e.com/', now: new Date('2026-01-01T00:00:00Z') });
    a = addEntry(a, 'one', new Date('2026-01-02T03:04:17.123Z'));
    // the same note after a Markdown round-trip: seconds are gone
    const back = fromMarkdown(toMarkdown(a));
    assert.equal(back.entries[0].at.slice(17), '00.000Z');
    const m = mergeNotes(a, back, new Date('2026-06-01T00:00:00Z'));
    assert.equal(m.entries.length, 1, 'round-tripped entry must not duplicate');
    // reminders: existing wins; a new note only takes a future reminder
    const withPast = { ...back, remind: '2026-01-05T09:00:00.000Z' };
    assert.equal(mergeNotes({ ...a, remind: null }, withPast, new Date('2026-06-01T00:00:00Z')).remind, null);
    assert.equal(mergeNotes(null, withPast, new Date('2026-06-01T00:00:00Z')).remind, null);
    const withFuture = { ...back, remind: '2027-01-05T09:00:00.000Z' };
    assert.equal(mergeNotes(null, withFuture, new Date('2026-06-01T00:00:00Z')).remind, '2027-01-05T09:00:00.000Z');
    assert.equal(mergeNotes({ ...a, remind: '2026-12-25T00:00:00.000Z' }, withFuture).remind, '2026-12-25T00:00:00.000Z');
});

test('addSnapshot ignores an identical capture within the hour', async () => {
    const { addSnapshot } = await import('../src/lib/notes.js');
    let n = newNote({ url: 'https://e.com/', title: 'E', key: 'k' });
    n = addSnapshot(n, { title: 'E', text: 'v1' }, new Date('2026-01-01T00:00:00Z'));
    const same = addSnapshot(n, { title: 'E', text: 'v1' }, new Date('2026-01-01T00:30:00Z'));
    assert.equal(same, n);
    const later = addSnapshot(n, { title: 'E', text: 'v1' }, new Date('2026-01-01T02:00:00Z'));
    assert.notEqual(later, n);
    assert.equal(later.snapshots[0].seen, '2026-01-01T02:00:00.000Z');
});

test('setToday creates, updates and removes the day\'s entry without duplicating it', async () => {
    const { setToday, todayIndex, localDay } = await import('../src/lib/notes.js');
    const day = new Date('2026-10-11T09:00:00');
    let n = newNote({ url: 'https://e.com/', title: 'E', key: 'k', now: new Date('2026-10-10T09:00:00') });
    n = addEntry(n, 'yesterday', new Date('2026-10-10T09:00:00'));
    assert.equal(todayIndex(n, day), -1);
    n = setToday(n, 'first words', day);
    assert.equal(n.entries.length, 2);
    assert.equal(todayIndex(n, day), 1);
    const later = new Date('2026-10-11T17:30:00');
    n = setToday(n, 'first words, then more', later);
    assert.equal(n.entries.length, 2, 'same day edits the entry');
    assert.equal(n.entries[1].text, 'first words, then more');
    assert.equal(localDay(n.entries[1].at), '2026-10-11', 'keeps the first timestamp of the day');
    assert.ok(n.entries[1].edited);
    const unchanged = setToday(n, 'first words, then more', later);
    assert.equal(unchanged, n, 'identical text is a no-op');
    n = setToday(n, '   ', later);
    assert.equal(n.entries.length, 1, 'emptying removes the day');
    assert.equal(setToday(n, '', later), n);
});

test('cleanTitle strips unread counters and keeps the site name', async () => {
    const { cleanTitle } = await import('../src/lib/notes.js');
    assert.equal(cleanTitle('(3) Jane Doe | LinkedIn'), 'Jane Doe | LinkedIn');
    assert.equal(cleanTitle('(12+) Jane Doe | LinkedIn'), 'Jane Doe | LinkedIn');
    assert.equal(cleanTitle('[2] Inbox - Gmail'), 'Inbox - Gmail');
    assert.equal(cleanTitle('• (1) Slack | general'), 'Slack | general');
    assert.equal(cleanTitle('Fix consolidate target · Pull Request #482 · dataro/app'), 'Fix consolidate target · Pull Request #482 · dataro/app');
    assert.equal(cleanTitle('  Spaced   out  '), 'Spaced out');
    assert.equal(cleanTitle('(1) '), '(1)');
    assert.equal(cleanTitle(''), '');
});

test('a capture with a new title renames the note; newNote cleans its title', async () => {
    const { addSnapshot } = await import('../src/lib/notes.js');
    let n = newNote({ url: 'https://www.linkedin.com/in/jane/', title: '(4) Jane Doe | LinkedIn', key: 'linkedin:in/jane' });
    assert.equal(n.title, 'Jane Doe | LinkedIn');
    n = addSnapshot(n, { title: '(9) Jane D. | LinkedIn', text: 'v1', meta: { siteName: 'LinkedIn' } }, new Date('2026-01-01T00:00:00Z'));
    assert.equal(n.title, 'Jane D. | LinkedIn');
    assert.equal(n.snapshots[0].title, '(9) Jane D. | LinkedIn', 'the capture keeps the raw title');
});

test('stickies: add, update, remove, feedback, and Markdown round-trip', async () => {
    const { addSticky, updateSticky, removeSticky, feedbackMarkdown } = await import('../src/lib/notes.js');
    let n = newNote({ url: 'https://site.test/pricing', title: 'Pricing – Site', key: 'https://site.test/pricing', now: new Date('2026-10-15T01:00:00Z') });
    const anchor = { css: '#pricing > p:nth-of-type(1)', path: 'body > main:nth-of-type(1) > p:nth-of-type(1)', quote: { exact: 'Plans start at $9 per month', prefix: 'Pricing ', suffix: ', billed' }, tag: 'p', label: '' };
    n = addSticky(n, { anchor, text: 'Say "from $9/mo" and lead with annual savings.' }, new Date('2026-10-15T01:00:00Z'));
    n = addSticky(n, { anchor: { ...anchor, css: '#pricing > h2:nth-of-type(1)', quote: { exact: 'Pricing', prefix: '', suffix: '' }, tag: 'h2' }, text: 'Too small on mobile.' });
    assert.equal(n.stickies.length, 2);
    const id = n.stickies[0].id;
    n = updateSticky(n, id, { text: 'Say "from $9/mo".' });
    assert.equal(n.stickies[0].text, 'Say "from $9/mo".');
    assert.equal(updateSticky(n, id, { text: 'Say "from $9/mo".' }), n, 'no change is a no-op');
    const fb = feedbackMarkdown(n);
    assert.match(fb, /^Feedback on Pricing – Site\nhttps:\/\/site\.test\/pricing\n\n1\. "Plans start at \$9 per month"\n   Say "from \$9\/mo"\.\n2\. "Pricing"\n   Too small on mobile\.$/);
    const md = toMarkdown(n);
    assert.match(md, /## Stickies\n\n1\. \*\*"Plans start at \$9 per month"\*\* — Say "from \$9\/mo"\.\n   <!-- sticky \{/);
    const back = fromMarkdown(md);
    assert.equal(back.stickies.length, 2);
    assert.equal(back.stickies[0].id, id);
    assert.deepEqual(back.stickies[0].anchor, anchor);
    assert.equal(back.stickies[0].text, 'Say "from $9/mo".');
    assert.equal(back.entries.length, 0, 'the stickies section is not an entry');
    // a hand-written stickies item without the hidden anchor still imports by quote
    const hand = `---\ntitle: T\nurl: https://x.test/\nkey: https://x.test/\n---\nnote body\n\n## Stickies\n\n1. **"Some heading"** — tighten this\n`;
    const h = fromMarkdown(hand);
    assert.equal(h.entries.length, 1);
    assert.equal(h.stickies[0].anchor.quote.exact, 'Some heading');
    assert.equal(h.stickies[0].text, 'tighten this');
    n = removeSticky(n, id);
    assert.equal(n.stickies.length, 1);
    assert.equal(removeSticky(n, 'nope'), n);
});
