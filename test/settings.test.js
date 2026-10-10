import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, mergeSettings } from '../src/lib/settings.js';
import { DEFAULT_RULES } from '../src/lib/url.js';

test('mergeSettings fills defaults, keeps rules, normalises partial input', () => {
    const s = mergeSettings({});
    assert.equal(s.showBadge, true);
    assert.equal(s.rules.length, DEFAULT_RULES.length);
    assert.equal(mergeSettings({ snapshotOnSave: false }).snapshotOnSave, false);
    assert.deepEqual(mergeSettings({ rules: 'junk' }).rules.length, DEFAULTS.rules.length);
    assert.deepEqual(mergeSettings({ rules: [] }).rules, []);
});
