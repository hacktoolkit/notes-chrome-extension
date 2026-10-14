// Settings persistence: chrome.storage.sync with a local fallback, the newer
// copy wins on load, plus JSON export/import of settings (notes export is
// separate, see store.js and notes.js).

import { DEFAULT_NORMALIZATION, DEFAULT_RULES } from './url.js';

export const DEFAULTS = {
    showBadge: true,
    openTabOnReminder: true,
    snapshotOnSave: true,
    writeToVault: true,
    openInSidePanel: false,
    normalization: { ...DEFAULT_NORMALIZATION },
    rules: DEFAULT_RULES.map((r) => ({ ...r, enabled: true }))
};

const KEYS = ['settings', 'savedAt'];

function area(name) {
    return globalThis.chrome && chrome.storage && chrome.storage[name] ? chrome.storage[name] : null;
}
async function read(name) {
    const store = area(name);
    if (!store) return {};
    try { return await store.get(KEYS); } catch (e) { return {}; }
}
async function write(name, data) {
    const store = area(name);
    if (!store) return false;
    try { await store.set(data); return true; } catch (e) { return false; }
}

export function mergeSettings(stored) {
    const s = { ...DEFAULTS, ...(stored || {}) };
    s.normalization = { ...DEFAULT_NORMALIZATION, ...((stored && stored.normalization) || {}) };
    s.rules = Array.isArray(stored?.rules) ? stored.rules : DEFAULTS.rules.map((r) => ({ ...r }));
    return s;
}

export async function loadSettings() {
    const [sync, local] = await Promise.all([read('sync'), read('local')]);
    const pick = sync.settings && local.settings ? ((local.savedAt || 0) > (sync.savedAt || 0) ? local : sync) : sync.settings ? sync : local;
    return { settings: mergeSettings(pick.settings), source: pick === local ? 'local' : 'sync' };
}

export async function saveSettings(settings) {
    const payload = { settings: mergeSettings(settings), savedAt: Date.now() };
    const ok = await write('sync', payload);
    await write('local', payload);
    return ok ? 'sync' : 'local';
}
