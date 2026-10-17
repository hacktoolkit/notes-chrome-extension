import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, LAUNCH_MODES, mergeSettings } from '../src/lib/settings.js';
import { DEFAULT_RULES } from '../src/lib/url.js';

test('mergeSettings fills defaults, keeps rules, normalises partial input', () => {
    const s = mergeSettings({});
    assert.equal(s.showBadge, true);
    assert.equal(s.rules.length, DEFAULT_RULES.length);
    assert.equal(mergeSettings({ snapshotOnSave: false }).snapshotOnSave, false);
    assert.deepEqual(mergeSettings({ rules: 'junk' }).rules.length, DEFAULTS.rules.length);
    assert.deepEqual(mergeSettings({ rules: [] }).rules, []);
});

test('launch mode defaults to the popup, migrates the old sidebar switch and rejects unknown modes', () => {
    assert.deepEqual(LAUNCH_MODES, ['popup', 'sidebar', 'floating']);
    assert.equal(mergeSettings({}).launch, 'popup');
    assert.equal(mergeSettings({ openInSidePanel: true }).launch, 'sidebar');
    assert.equal(mergeSettings({ openInSidePanel: false }).launch, 'popup');
    assert.equal(mergeSettings({ launch: 'floating' }).launch, 'floating');
    assert.equal(mergeSettings({ launch: 'floating', openInSidePanel: true }).launch, 'floating');
    assert.equal(mergeSettings({ launch: 'bogus' }).launch, 'popup');
    assert.equal('openInSidePanel' in mergeSettings({ openInSidePanel: true }), false);
});
