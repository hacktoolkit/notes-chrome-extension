import { DEFAULTS, loadSettings, saveSettings } from './lib/settings.js';
import { canonicalize, compileRules, normalizeUrl } from './lib/url.js';
import { clearVaultHandle, loadVaultHandle, saveVaultHandle } from './lib/store.js';

const $ = (sel) => document.querySelector(sel);
import { el, fmt, send } from './lib/ui.js';
const APP_NAME = chrome.runtime.getManifest().name;
let settings = {};

function setState(text) { $('#save-state').textContent = text; }

// ----- notes list --------------------

function noteRow(r, { showRemind = false } = {}) {
    return el('div', { class: 'note', 'data-id': r.id }, [
        el('a', { class: 't', href: r.url, target: '_blank', rel: 'noopener', text: r.title || r.url }),
        el('div', { class: 'u', text: `${r.host}${r.entries ? ` · ${r.entries} entr${r.entries === 1 ? 'y' : 'ies'}` : ' · captured only'}${r.captures ? ` · ${r.captures} capture${r.captures === 1 ? '' : 's'}` : ''}${r.rule ? ` · ${r.rule}` : ''}` }),
        el('div', { class: 'p', text: r.preview }),
        el('div', { class: 'm' }, [
            el('span', { text: showRemind && r.remind ? `⏰ ${fmt(r.remind)}` : `updated ${fmt(r.updated)}` }),
            el('span', { class: 'tools' }, [
                el('button', { text: 'Details', onclick: () => chrome.tabs.create({ url: chrome.runtime.getURL(`src/note.html?id=${r.id}`) }) }),
                el('button', { text: 'Open', onclick: () => chrome.tabs.create({ url: r.url }) }),
                el('button', { class: 'ghost', text: 'Delete', onclick: async () => { if (confirm(`Delete the note for "${r.title}"?`)) { await send('deleteNote', { id: r.id }); await renderLists(); } } })
            ])
        ])
    ]);
}

async function renderLists() {
    const rows = await send('list', { query: $('#search').value, includeCaptures: $('#include-captures').checked });
    const list = $('#note-list');
    list.innerHTML = '';
    $('#note-count').textContent = String(rows.length);
    if (rows.length === 0) list.append(el('div', { class: 'empty', text: $('#search').value ? 'No notes match.' : 'No notes yet. Click the toolbar icon on any page to start one.' }));
    rows.forEach((r) => list.append(noteRow(r)));
    const reminders = await send('reminders');
    const rl = $('#reminder-list');
    rl.innerHTML = '';
    if (reminders.length === 0) rl.append(el('div', { class: 'empty', text: 'No reminders set.' }));
    reminders.forEach((r) => rl.append(noteRow(r, { showRemind: true })));
}

// ----- backup --------------------

async function exportAll() {
    const { count, files, base64 } = await send('export');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: 'application/zip' });
    const a = el('a', { href: URL.createObjectURL(blob), download: `page-notes-${new Date().toISOString().slice(0, 10)}.zip` });
    document.body.append(a); a.click(); a.remove();
    $('#backup-status').textContent = `Exported ${count} note${count === 1 ? '' : 's'} and ${files - count} capture${files - count === 1 ? '' : 's'}.`;
}

async function importFiles(fileList) {
    const files = [];
    for (const f of fileList) files.push({ name: f.name, text: await f.text() });
    const r = await send('import', { files });
    $('#backup-status').textContent = `Imported ${r.imported}, merged ${r.merged}${r.errors.length ? `, ${r.errors.length} failed: ${r.errors[0]}` : ''}.`;
    await renderLists();
}

// ----- vault --------------------

const FS_ACCESS = typeof window.showDirectoryPicker === 'function';

async function renderVault() {
    const handle = await loadVaultHandle();
    const status = $('#vault-status');
    if (!FS_ACCESS) {
        $('#vault-connect').disabled = true;
        $('#vault-unsupported').hidden = false;
        $('#vault-disconnect').hidden = true;
        $('#vault-write').hidden = true;
        $('#vault-reconnect').hidden = true;
        status.textContent = '';
        return;
    }
    $('#vault-connect').hidden = !!handle;
    $('#vault-disconnect').hidden = !handle;
    $('#vault-write').hidden = !handle;
    $('#vault-reconnect').hidden = true;
    if (!handle) { status.textContent = 'Not connected.'; return; }
    const perm = await handle.queryPermission({ mode: 'readwrite' });
    if (perm === 'granted') status.textContent = `Connected to "${handle.name}".`;
    else { status.textContent = `Connected to "${handle.name}", access needs re-allowing this session.`; $('#vault-reconnect').hidden = false; }
}

async function connectVault() {
    try {
        const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
        await saveVaultHandle(handle);
        await renderVault();
        const r = await send('writeAllToVault');
        $('#vault-status').textContent += ` Wrote ${r.written} of ${r.total}.`;
    } catch (e) {
        if (e.name !== 'AbortError') $('#vault-status').textContent = e.message;
    }
}

async function reconnectVault() {
    const handle = await loadVaultHandle();
    if (!handle) return;
    await handle.requestPermission({ mode: 'readwrite' });
    await renderVault();
}

// ----- settings --------------------

const BOOLS = ['showBadge', 'openTabOnReminder', 'snapshotOnSave', 'writeToVault'];

function renderSettings() {
    BOOLS.forEach((k) => { $(`#${k}`).checked = !!settings[k]; });
    $('#rules').value = JSON.stringify(settings.rules.map(({ name, match, key, enabled, flags }) => ({ name, match, key, enabled: enabled !== false, ...(flags !== undefined ? { flags } : {}) })), null, 2);
}

async function save() {
    const where = await saveSettings(settings);
    setState(where === 'sync' ? 'Saved and synced' : 'Saved locally');
    await send('settingsChanged');
}

function runTester() {
    const url = $('#test-url').value.trim();
    const out = $('#test-result');
    if (!url) { out.textContent = ''; return; }
    const { compiled } = compileRules(settings.rules);
    const { key, rule } = canonicalize(url, compiled, settings.normalization);
    out.textContent = rule ? `${rule}  →  ${key}` : `No rule matched. Normalized  →  ${normalizeUrl(url, settings.normalization)}`;
}

function applyRules() {
    const err = $('#rules-error');
    try {
        const rules = JSON.parse($('#rules').value);
        if (!Array.isArray(rules)) throw new Error('Expected an array');
        rules.forEach((r, i) => { if (typeof r.match !== 'string' || typeof r.key !== 'string') throw new Error(`Rule ${i + 1} needs string "match" and "key"`); });
        const { errors } = compileRules(rules);
        if (errors.length) throw new Error(`${errors[0].rule.name || 'A rule'}: ${errors[0].error}`);
        settings.rules = rules;
        err.hidden = true;
        save();
        runTester();
    } catch (e) {
        err.textContent = e.message;
        err.hidden = false;
    }
}

// ----- init --------------------

async function init() {
    $('#app-name').textContent = APP_NAME;
    document.title = APP_NAME;
    $('#version').textContent = `v${chrome.runtime.getManifest().version}`;
    settings = (await loadSettings()).settings;
    renderSettings();
    await renderLists();
    await renderVault();

    $('#search').addEventListener('input', () => renderLists());
    $('#include-captures').addEventListener('change', () => renderLists());
    $('#export').addEventListener('click', () => exportAll().catch((e) => { $('#backup-status').textContent = e.message; }));
    $('#import').addEventListener('click', () => $('#import-file').click());
    $('#import-file').addEventListener('change', (e) => importFiles(e.target.files).catch((err) => { $('#backup-status').textContent = err.message; }).finally(() => { e.target.value = ''; }));
    $('#vault-connect').addEventListener('click', connectVault);
    $('#copy-flag').addEventListener('click', () => { navigator.clipboard.writeText('brave://flags/#file-system-access-api'); $('#copy-flag').textContent = 'Copied'; });
    $('#vault-reconnect').addEventListener('click', reconnectVault);
    $('#vault-write').addEventListener('click', async () => { const r = await send('writeAllToVault'); $('#vault-status').textContent = r.status === 'written' ? `Wrote ${r.written} notes.` : `Could not write (${r.status}).`; });
    $('#vault-disconnect').addEventListener('click', async () => { await clearVaultHandle(); await renderVault(); });
    BOOLS.forEach((k) => $(`#${k}`).addEventListener('change', (e) => { settings[k] = e.target.checked; save(); }));
    $('#test-url').addEventListener('input', runTester);
    $('#rules-apply').addEventListener('click', applyRules);
    $('#rules-reset').addEventListener('click', () => { settings.rules = DEFAULTS.rules.map((r) => ({ ...r })); renderSettings(); save(); runTester(); });

    const links = [...document.querySelectorAll('nav a')];
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) links.forEach((a) => a.classList.toggle('on', a.getAttribute('href') === `#${en.target.id}`)); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    links.forEach((a) => observer.observe($(a.getAttribute('href'))));
    if (location.hash) $(location.hash)?.scrollIntoView();
}
init();
