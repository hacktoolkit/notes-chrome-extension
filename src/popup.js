// The popup shows the note for the current page and sends every change to the
// service worker. The same page runs three ways: as the popup (bound to the
// tab it opened on), as the side panel (follows its window's active tab) and
// embedded in the floating widget on a page (bound to that tab, closes by
// asking the layer around it).

const $ = (sel) => document.querySelector(sel);
import { el, fmt, send } from './lib/ui.js';
import { createExplorer } from './lib/explorer.js';
import { createPagePicker } from './lib/picker.js';
import { cleanTitle } from './lib/notes.js';
import { loadVaultHandle } from './lib/store.js';
import { canObserve, changeCollector, observeHandle } from './lib/vault.js';
const APP_NAME = chrome.runtime.getManifest().name;
const SHORT_NAME = chrome.runtime.getManifest().short_name || APP_NAME;
const EMBED = new URLSearchParams(location.search).has('embed');
if (EMBED) document.body.classList.add('embed');
const PANEL = document.body.classList.contains('panel');
let ownTabId = null; // the tab the embedded widget sits in
let current = null; // { tab, ident, note, insights, today }
let draftTimer = null;
let lastSentText = null;
let draftPromise = null;
let refreshVersion = 0;
let library = null;
let libraryVisible = false;
let noticedPage = null;

// The library sits above the page in the hierarchy: Sites > Pages > this page.
// Going back from the page lands on its site's page list; the arrow inside
// the library climbs one level and disappears at the top. Returning to the
// current page is a separate, forward action in the footer.
async function showLibrary(show = true, { root = false } = {}) {
    if (!PANEL || !await flushDraft()) return;
    libraryVisible = show;
    document.body.classList.toggle('browsing', show);
    $('#open-all').hidden = show;
    $('#return-to-page').hidden = !show;
    $('.head').hidden = show;
    $('main').hidden = show;
    $('#library').hidden = !show;
    if (show) {
        library ||= createExplorer($('#library-explorer'), { onNavigate: (depth, where) => {
            // the library header names the level: all notes, a site, a page
            $('#library-up').hidden = depth === 0;
            const h2 = $('#library-title'), sub = $('#library-sub');
            const pages = (n) => `${n} saved page${n === 1 ? '' : 's'}`;
            if (depth === 0) { h2.textContent = 'All notes'; sub.textContent = where.sites ? `${pages(where.pages)} across ${where.sites} site${where.sites === 1 ? '' : 's'}` : 'Your pages, together.'; }
            else if (depth === 1) { h2.textContent = where.host || 'All pages'; sub.textContent = where.host ? pages(where.pages) : `${pages(where.pages)}, listed by site`; }
            else { h2.textContent = where.title || 'Saved page'; sub.textContent = where.site || where.host || 'Saved page'; }
        } });
        await library.reload();
        const host = current?.note?.host || (current?.tab?.url && /^https?:/.test(current.tab.url) ? new URL(current.tab.url).hostname.replace(/^www\./, '') : '');
        library.focus(root ? {} : { host, id: current?.ident?.id });
        $('#library-explorer input[type="search"]').focus();
    } else await refresh({ capture: false });
}

// Close this view: the popup window, the side panel, or the widget around us.
function dismiss() {
    if (EMBED) window.parent.postMessage({ type: 'pn:widget-close' }, '*');
    else window.close();
}

let toastTimer;
function toast(msg, error = false) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = `toast${error ? ' error' : ''}`;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2500);
}

function setStatus(text, cls = '') {
    const st = $('#status');
    st.textContent = text;
    st.className = `status ${cls}`;
}

function renderText(text) {
    const wrap = el('div', { class: 'text' });
    let quote = null;
    for (const line of text.split('\n')) {
        if (line.startsWith('> ')) {
            if (!quote) { quote = el('div', { class: 'q' }); wrap.append(quote); }
            quote.append(el('div', { text: line.slice(2) }));
        } else {
            quote = null;
            wrap.append(el('div', { text: line || ' ' }));
        }
    }
    return wrap;
}

function renderInsights(ins) {
    const box = $('#insights');
    box.innerHTML = '';
    if (!ins) { box.hidden = true; return; }
    const rows = [];
    for (const e of (ins.edits || []).slice(0, 3)) rows.push(el('div', { class: 'ins edit' }, [el('span', { class: 'tag', text: 'edited' }), e.text]));
    for (const f of (ins.findings || []).filter((x) => x.level === 'ask').slice(0, 3)) rows.push(el('div', { class: 'ins ask' }, [el('span', { class: 'tag', text: 'ask' }), f.text]));
    if (ins.summary) {
        const s = ins.summary;
        rows.push(el('div', { class: 'ins summary' }, [
            el('span', {}, [el('b', { text: `${s.years} yrs` }), ' exp']),
            el('span', {}, [el('b', { text: String(s.employers) }), ' employers']),
            el('span', {}, [el('b', { text: `${Math.round(s.averageTenureMonths / 12 * 10) / 10} yrs` }), ' avg tenure']),
            el('a', { class: 'ghost', text: 'copy card', title: s.card, onclick: () => { navigator.clipboard.writeText(s.card); toast('Card line copied'); } })
        ]));
    } else if (ins.changed && (ins.changed.addedCount || ins.changed.removedCount || ins.changed.titleChanged)) {
        rows.push(el('div', { class: 'ins edit' }, [el('span', { class: 'tag', text: 'changed' }), `Changed since ${fmt(ins.changed.since)}: ${ins.changed.addedCount} lines added, ${ins.changed.removedCount} removed.`]));
    }
    const shown = rows.filter((r) => !r.classList.contains('summary')).length;
    const extra = (ins.findings?.length || 0) + (ins.edits?.length || 0) - shown;
    if (rows.length > 0 || ins.captures > 1) {
        rows.push(el('div', { class: 'more' }, [el('a', { text: `${extra > 0 ? `${extra} more · ` : ''}${ins.captures} capture${ins.captures === 1 ? '' : 's'} · details`, onclick: openDetail })]));
    }
    rows.forEach((r) => box.append(r));
    box.hidden = rows.length === 0;
}

function renderStickies() {
    const { tab, note, alwaysShow } = current || {};
    const box = $('#stickies');
    const web = tab && /^https?:/.test(tab.url || '');
    box.hidden = !web;
    if (!web) return;
    const list = $('#sticky-list');
    list.innerHTML = '';
    const stickies = note?.stickies || [];
    $('#toggle-stickies').hidden = stickies.length === 0;
    $('#toggle-stickies').textContent = current.stickiesVisible === false ? 'Show all' : 'Hide all';
    $('#toggle-stickies').setAttribute('aria-pressed', String(current.stickiesVisible !== false));
    $('#toggle-stickies').title = 'Show or hide stickies on all pages';
    $('#copy-feedback').hidden = stickies.length === 0;
    $('#share-stickies').hidden = stickies.length === 0;
    if (stickies.length === 0) {
        list.append(el('li', { class: 'empty-row', text: 'Pin a comment to any part of this page.' }));
    }
    stickies.forEach((st, i) => {
        const quote = st.anchor?.quote?.exact ? `“${st.anchor.quote.exact.slice(0, 70)}${st.anchor.quote.exact.length > 70 ? '…' : ''}”` : (st.anchor?.label || st.anchor?.tag || 'element');
        const li = el('li', { class: st.found === false ? 'orphan' : '', title: st.found === false ? 'Could not find this spot on the page as it is now' : 'Show on the page' }, [
            el('span', { class: 'n', text: String(i + 1) }),
            el('span', {}, [el('div', { class: 'q', text: quote }), el('div', { class: `t${st.text ? '' : ' empty'}`, text: st.text || 'No comment yet' })]),
            el('button', { class: 'x', text: '✕', title: 'Remove', onclick: async (e) => { e.stopPropagation(); await send('stickyRemove', { url: tab.url, id: st.id }); await refresh({ keepEditor: true }); } })
        ]);
        li.addEventListener('click', async () => { try { await send('annotate', { tabId: tab.id, scrollTo: st.id }); if (!PANEL || EMBED) dismiss(); } catch (e) { toast(e.message, true); } });
        list.append(li);
    });
    const always = $('#always-show');
    always.hidden = !alwaysShow?.origin || stickies.length === 0;
    if (alwaysShow?.origin) {
        $('#always-origin').textContent = alwaysShow.origin.replace(/^https?:\/\//, '');
        $('#always-show-toggle').checked = !!alwaysShow.enabled;
    }
}

// Linked pages: connections the user drew between pages, across sites.
let picker = null;
function renderLinked() {
    const { tab, linked = [], note } = current || {};
    const box = $('#linked');
    const web = tab && /^(https?|file):/.test(tab.url || '');
    box.hidden = !web;
    if (!web) return;
    const list = $('#linked-list');
    list.innerHTML = '';
    if (!linked.length && !picker) list.append(el('li', { class: 'empty-row', text: 'Connect this page to another saved page, on any site: your GitHub profile to your LinkedIn, a ticket to its pull request.' }));
    for (const row of linked) {
        const li = el('li', { class: row.missing ? 'missing' : '', title: row.missing ? 'That page\'s note is gone' : (PANEL ? 'Show its notes' : 'Open the page') }, [
            el('span', { class: 'host', text: row.host || '·' }),
            el('span', { class: 'title', text: cleanTitle(row.title) || row.url || row.key }),
            el('button', { class: 'go', text: '↗', title: 'Open the page', 'aria-label': 'Open the page', hidden: row.missing || !row.url, onclick: async (e) => { e.stopPropagation(); try { await send('openNote', { id: row.id, page: true }); if (!PANEL || EMBED) dismiss(); } catch (err) { toast(err.message, true); } } }),
            el('button', { class: 'x', text: '✕', title: 'Unlink', 'aria-label': 'Unlink', onclick: async (e) => { e.stopPropagation(); try { const r = await send('unlink', { id: note.id, otherId: row.id }); current = { ...current, note: r.note, linked: r.linked }; renderLinked(); } catch (err) { toast(err.message, true); } } })
        ]);
        if (!row.missing) li.addEventListener('click', async () => {
            try {
                if (PANEL) { await showLibrary(true); library.show(row.id); }
                else await send('openNote', { id: row.id });
            } catch (err) { toast(err.message, true); }
        });
        list.append(li);
    }
}
function openLinkPicker() {
    if (picker) { picker.focus(); return; }
    const holder = $('#link-picker');
    const exclude = new Set([current?.ident?.id, ...(current?.linked || []).map((r) => r.id)].filter(Boolean));
    picker = createPagePicker({
        exclude,
        placeholder: 'Type to find a page to link…',
        onPick: async (row) => {
            closeLinkPicker();
            try {
                if (!await flushDraft()) return;
                const r = await send('link', { ...(current.note ? { id: current.note.id } : { tabId: current.tab.id, url: current.tab.url, title: current.tab.title }), otherId: row.id });
                current = { ...current, note: r.note, linked: r.linked };
                toast(`Linked to ${cleanTitle(row.title)}`);
                await refresh({ keepEditor: true, capture: false });
            } catch (err) { toast(err.message, true); }
        },
        onClose: closeLinkPicker
    });
    holder.replaceChildren(picker.root);
    holder.hidden = false;
    $('#add-link').setAttribute('aria-expanded', 'true');
    renderLinked();
    picker.focus();
}
function closeLinkPicker() {
    if (!picker) return;
    picker = null;
    $('#link-picker').hidden = true;
    $('#link-picker').replaceChildren();
    $('#add-link').setAttribute('aria-expanded', 'false');
    renderLinked();
}

// ----- sharing stickies as a flat file --------------------
let sharePanel = null; // 'export' | 'import' | null
function closeSharePanel() {
    sharePanel = null;
    const box = $('#share-panel');
    box.hidden = true; box.replaceChildren();
    $('#share-stickies').setAttribute('aria-expanded', 'false');
    $('#import-stickies').setAttribute('aria-expanded', 'false');
}
async function openSharePanel(mode) {
    if (sharePanel === mode) { closeSharePanel(); return; }
    closeSharePanel();
    sharePanel = mode;
    const box = $('#share-panel');
    box.hidden = false;
    $(mode === 'export' ? '#share-stickies' : '#import-stickies').setAttribute('aria-expanded', 'true');
    const status = el('div', { class: 'share-status', role: 'status' });
    const pass = el('input', { type: 'password', placeholder: mode === 'export' ? 'Passphrase (optional, encrypts the file)' : 'Passphrase, if it was encrypted', autocomplete: 'off', 'aria-label': 'Passphrase' });
    if (mode === 'export') {
        const includeEntries = el('input', { type: 'checkbox' });
        const out = el('textarea', { readonly: true, 'aria-label': 'Shared stickies text', spellcheck: 'false' });
        let result = null;
        const build = async () => {
            try {
                result = await send('shareExport', { id: current.note.id, passphrase: pass.value, includeEntries: includeEntries.checked });
                out.value = result.text;
                status.className = 'share-status';
                status.textContent = `${result.stickies} stick${result.stickies === 1 ? 'y' : 'ies'}${result.entries ? ` and ${result.entries} ${result.entries === 1 ? 'entry' : 'entries'}` : ''}, ${Math.round(result.text.length / 1024 * 10) / 10} KB${pass.value ? ', encrypted' : ', compressed only (anyone with the extension can read it)'}.`;
            } catch (e) { status.className = 'share-status error'; status.textContent = e.message; }
        };
        let passTimer; pass.addEventListener('input', () => { clearTimeout(passTimer); passTimer = setTimeout(build, 350); });
        includeEntries.addEventListener('change', build);
        box.append(
            el('div', { class: 'share-row' }, [el('b', { text: 'Share these stickies' }), el('span', { class: 'spacer' }), el('label', {}, [includeEntries, 'Include my notes too'])]),
            el('div', { class: 'share-row' }, [pass]),
            out,
            el('div', { class: 'share-row' }, [
                el('button', { class: 'tiny primary', text: 'Copy', onclick: async () => { if (!result) return; await navigator.clipboard.writeText(result.text); toast('Copied. Paste it into an email or chat.'); } }),
                el('button', { class: 'tiny', text: 'Download .txt', onclick: () => { if (!result) return; const a = el('a', { href: URL.createObjectURL(new Blob([result.text], { type: 'text/plain' })), download: result.fileName }); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); } }),
                el('span', { class: 'spacer' }),
                el('button', { class: 'ghost tiny', text: 'Close', onclick: closeSharePanel })
            ]),
            status
        );
        await build();
    } else {
        const input = el('textarea', { placeholder: 'Paste the shared text here (from -----BEGIN MARGINALIA----- to -----END MARGINALIA-----)', 'aria-label': 'Shared stickies text', spellcheck: 'false' });
        const file = el('input', { type: 'file', accept: '.txt,text/plain', hidden: true });
        file.addEventListener('change', async () => { if (file.files[0]) { input.value = await file.files[0].text(); doImport(); } });
        const doImport = async () => {
            try {
                if (!input.value.trim()) { status.className = 'share-status error'; status.textContent = 'Paste or choose the shared file first.'; return; }
                const r = await send('shareImport', { text: input.value, passphrase: pass.value, url: current.tab?.url });
                status.className = 'share-status ok';
                status.textContent = `Added ${r.addedStickies} stick${r.addedStickies === 1 ? 'y' : 'ies'}${r.addedEntries ? ` and ${r.addedEntries} ${r.addedEntries === 1 ? 'entry' : 'entries'}` : ''} to “${cleanTitle(r.title)}”${r.samePage === false ? ' (a different page than this one)' : ''}.`;
                if (r.samePage !== false) { await refresh({ keepEditor: true, capture: false }); if (!$('#share-panel').hidden) {/* keep the status visible */} }
                if (r.samePage === false) toast(`Imported to ${cleanTitle(r.title)}`);
            } catch (e) { status.className = 'share-status error'; status.textContent = e.message; }
        };
        box.append(
            el('div', { class: 'share-row' }, [el('b', { text: 'Import shared stickies' }), el('span', { class: 'spacer' }), el('button', { class: 'ghost tiny', text: 'Choose file…', onclick: () => file.click() }), file]),
            input,
            el('div', { class: 'share-row' }, [pass, el('button', { class: 'tiny primary', text: 'Import', onclick: doImport }), el('button', { class: 'ghost tiny', text: 'Close', onclick: closeSharePanel })]),
            status
        );
        input.focus();
    }
}

// While the side panel or widget is open it is a long-lived page: watch the
// vault folder from here and ask the worker for a scoped sync as files land.
let pageObserver = null;
async function watchVaultFromPage() {
    if (!PANEL || pageObserver || !canObserve()) return;
    try {
        const handle = await loadVaultHandle();
        if (!handle || (await handle.queryPermission({ mode: 'readwrite' })) !== 'granted') return;
        const changes = changeCollector((names) => send('syncVault', { only: names ? [...names] : undefined }).catch(() => {}));
        pageObserver = await observeHandle(handle, (change) => changes.add(change));
    } catch (e) { /* the alarm still runs */ }
}

function renderVaultHint() {
    const hint = $('#vault-hint');
    hint.hidden = current?.vault?.result !== 'no-permission';
}

function openDetail() {
    if (current?.note) chrome.tabs.create({ url: chrome.runtime.getURL(`src/note.html?id=${current.note.id}`) });
}

function render({ keepEditor = false } = {}) {
    const { ident, note, today } = current || {};
    // browser and extension pages hold no notes
    const tab = current?.tab && /^(https?|file):/.test(current.tab.url || '') ? current.tab : null;
    $('#empty').hidden = !!tab;
    $('#empty').textContent = current?.tab ? 'Nothing to note on this page.' : 'No page here.';
    $('#compose').hidden = !tab;
    $('#insights').hidden = !tab;
    $('#entries').hidden = !tab;
    $('#page-title').textContent = tab ? cleanTitle(note?.title || tab.title || tab.url) : SHORT_NAME;
    $('#page-url').textContent = tab ? tab.url.replace(/^https?:\/\//, '') : '';
    const fav = $('#fav');
    fav.src = tab?.favIconUrl && !tab.favIconUrl.startsWith('chrome://') ? tab.favIconUrl : '../img/icon32.png';
    const rule = $('#rule');
    rule.hidden = !ident?.rule;
    rule.textContent = ident?.rule || '';
    rule.title = ident ? `This note follows the page: ${ident.key}` : '';
    $('#open-detail').hidden = !note;
    if (PANEL) $('#capture-hint').hidden = !tab || !!(note && note.snapshots && note.snapshots.length) || !/^https?:/.test(tab.url || '');

    const savedCount = (note?.entries.length || 0) + (note?.stickies?.length || 0);
    const savedHere = $('#saved-here');
    savedHere.hidden = !tab || !savedCount;
    savedHere.textContent = `${savedCount} saved note${savedCount === 1 ? '' : 's'} on this page`;
    if (noticedPage !== ident?.id) {
        savedHere.classList.remove('arrived');
        if (savedCount) { void savedHere.offsetWidth; savedHere.classList.add('arrived'); }
        noticedPage = ident?.id;
    }

    // the editor holds today's entry
    const editor = $('#entry');
    const todayEntry = note && today >= 0 ? note.entries[today] : null;
    if (!keepEditor) {
        editor.value = todayEntry ? todayEntry.text : '';
        lastSentText = editor.value;
    }
    $('#today-label').textContent = todayEntry ? `Today, started ${fmt(todayEntry.at).slice(11)}` : 'Today';

    const rem = $('#reminder');
    rem.hidden = !note?.remind;
    rem.innerHTML = '';
    if (note?.remind) rem.append(`⏰ ${fmt(note.remind)}`, el('button', { class: 'ghost', text: 'clear', onclick: () => setReminder({ when: null }) }));
    document.querySelectorAll('#chips .chip[data-preset]').forEach((c) => c.classList.toggle('on', false));

    renderInsights(current?.insights);
    renderStickies();
    renderLinked();
    renderVaultHint();

    const list = $('#entries');
    list.innerHTML = '';
    const entries = (note?.entries || []).map((e, i) => ({ ...e, i })).filter((e) => e.i !== today).reverse();
    for (const e of entries) {
        const li = el('li', { class: 'entry' });
        const text = renderText(e.text);
        const when = el('div', { class: 'when' }, [fmt(e.at), e.edited ? el('span', { class: 'muted', text: '(edited)' }) : null]);
        when.append(el('span', { class: 'tools' }, [el('button', { class: 'ghost', text: 'delete', onclick: () => removeEntry(e.i) })]));
        text.addEventListener('click', () => editInPlace(li, text, e));
        li.append(when, text);
        list.append(li);
    }
    if (entries.length > 0) list.append(el('li', { class: 'hint', text: 'Click an entry to edit it. Changes save as you type.' }));
}

async function refresh({ keepEditor = false, capture = false } = {}) {
    const version = ++refreshVersion;
    if (!await flushDraft() || version !== refreshVersion) return;
    try {
        // the popup is bound to the tab it opened on; the panel follows the active tab
        const args = EMBED ? { tabId: ownTabId } : PANEL ? { windowId: (await chrome.windows.getCurrent()).id } : { tabId: current?.tab?.id };
        const editorText = $('#entry').value;
        const next = await send('current', { ...args, capture });
        if (version !== refreshVersion) return;
        const samePage = current?.ident?.id === next.ident?.id;
        // Typing can continue while the page lookup is in flight. Save it to
        // the old page before replacing the editor on a navigation.
        if (!samePage && !await flushDraft()) return;
        if (version !== refreshVersion) return;
        keepEditor = samePage && (keepEditor || !!draftPromise || $('#entry').value !== lastSentText || $('#entry').value !== editorText);
        current = next;
        if (!samePage) setStatus('');
    } catch (e) {
        if (version !== refreshVersion) return;
        toast(e.message, true);
        return;
    }
    render({ keepEditor });
}

// ----- autosave: the editor is today's entry --------------------

function scheduleDraft() {
    const text = $('#entry').value;
    if (text === lastSentText) return;
    setStatus('Saving…', 'saving');
    clearTimeout(draftTimer);
    draftTimer = setTimeout(flushDraft, 400);
}

async function flushDraft() {
    clearTimeout(draftTimer);
    // Blur, navigation and the debounce timer can all request the same save.
    // Await it, then drain any text typed while it was in flight.
    if (draftPromise) {
        if (!await draftPromise) return false;
        return flushDraft();
    }
    const text = $('#entry').value;
    if (text === lastSentText || !current?.tab) return true;
    const { tab, ident } = current;
    draftPromise = (async () => {
        try {
            // The tab may already have navigated or closed. The displayed
            // URL still identifies the note this editor belongs to.
            const r = await send('draft', { tabId: tab.id, url: tab.url, title: current.note?.title || tab.title, text });
            if (current?.ident?.id === ident?.id) {
                lastSentText = text;
                current = { ...current, note: r.note, today: r.today };
                if ($('#entry').value === text) setStatus(text.trim() ? `Saved ${fmt(new Date().toISOString()).slice(11)}` : '', 'saved');
                render({ keepEditor: true });
            }
            return true;
        } catch (e) {
            setStatus(e.message, 'error');
            return false;
        }
    })();
    const saved = await draftPromise;
    draftPromise = null;
    return saved ? flushDraft() : false;
}

// ----- older entries: edit in place --------------------

function editInPlace(li, textNode, e) {
    if (textNode.getAttribute('contenteditable') === 'true') return;
    li.classList.add('editing');
    textNode.textContent = e.text;
    textNode.setAttribute('contenteditable', 'true');
    textNode.focus();
    let timer = null;
    const save = async () => {
        const value = textNode.innerText.trim();
        if (value === e.text) return;
        try {
            const note = await send('updateEntry', { id: current.note.id, index: e.i, text: value });
            current = { ...current, note };
            e.text = value;
            setStatus(`Saved ${fmt(new Date().toISOString()).slice(11)}`, 'saved');
        } catch (err) { toast(err.message, true); }
    };
    textNode.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(save, 500); });
    textNode.addEventListener('blur', async () => { clearTimeout(timer); await save(); await refresh({ keepEditor: true }); });
}

async function removeEntry(index) {
    try { await send('removeEntry', { id: current.note.id, index }); await refresh({ keepEditor: true }); } catch (e) { toast(e.message, true); }
}

// ----- reminders and snooze --------------------

async function setReminder({ preset, when }) {
    try {
        if (!await flushDraft()) return;
        if (!current.note || current.note.entries.length === 0) {
            // a reminder needs something to come back to
            const r = await send('draft', { tabId: current.tab.id, text: $('#entry').value.trim() || 'Reminder set.' });
            current = { ...current, note: r.note, today: r.today };
        }
        await send('setReminder', { id: current.note.id, preset, when });
        toast(preset || when ? 'Reminder set' : 'Reminder cleared');
        await refresh({ keepEditor: true });
    } catch (e) { toast(e.message, true); }
}

async function snoozeTab() {
    try {
        if (!await flushDraft()) return;
        await send('snoozeTab', { tabId: current.tab.id, preset: 'tomorrow' });
        if (!PANEL || EMBED) dismiss();
    } catch (e) { toast(e.message, true); }
}

function init() {
    const editor = $('#entry');
    editor.addEventListener('input', scheduleDraft);
    editor.addEventListener('blur', flushDraft);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushDraft(); });
    window.addEventListener('pagehide', flushDraft);
    document.querySelectorAll('#chips .chip[data-preset]').forEach((b) => b.addEventListener('click', () => setReminder({ preset: b.dataset.preset })));
    $('#remind-at').addEventListener('change', (e) => { if (e.target.value) setReminder({ when: new Date(e.target.value).toISOString() }); });
    $('#snooze').addEventListener('click', snoozeTab);
    $('#toggle-stickies').addEventListener('click', async () => {
        try {
            const visible = current.stickiesVisible === false;
            await send('stickyVisibility', { visible });
            current.stickiesVisible = visible;
            renderStickies();
            if (visible) await send('annotate', { tabId: current.tab.id });
        } catch (e) { toast(e.message, true); }
    });
    $('#add-link').addEventListener('click', () => { if (picker) closeLinkPicker(); else openLinkPicker(); });
    $('#share-stickies').addEventListener('click', () => openSharePanel('export'));
    $('#import-stickies').addEventListener('click', () => openSharePanel('import'));
    $('#vault-allow').addEventListener('click', async () => {
        try {
            const handle = await loadVaultHandle();
            if (!handle) throw new Error('No vault folder is connected. Connect one in Settings.');
            if ((await handle.requestPermission({ mode: 'readwrite' })) !== 'granted') throw new Error('Access was not granted.');
            $('#vault-hint').hidden = true;
            watchVaultFromPage();
            const r = await send('syncVault');
            toast(r.status === 'ok' ? `Vault synced: ${r.report.imported + r.report.updated} read in, ${r.report.written} written` : `Vault: ${r.status}`, r.status !== 'ok');
            await refresh({ keepEditor: true, capture: false });
        } catch (e) { toast(e.message, true); }
    });
    $('#add-sticky').addEventListener('click', async () => {
        try {
            if (!await flushDraft()) return;
            await send('annotate', { tabId: current.tab.id, pick: true });
            if (!PANEL || EMBED) dismiss();
        } catch (e) { toast(e.message, true); }
    });
    $('#copy-feedback').addEventListener('click', async () => {
        try {
            const md = await send('feedback', { id: current.note.id });
            await navigator.clipboard.writeText(md);
            toast('Feedback copied');
        } catch (e) { toast(e.message, true); }
    });
    $('#always-show-toggle').addEventListener('change', async (e) => {
        try {
            if (e.target.checked) {
                const origin = new URL(current.tab.url).origin;
                const ok = await chrome.permissions.request({ origins: [`${origin}/*`] });
                if (!ok) throw new Error('Permission was not granted.');
            }
            const r = await send('alwaysShow', { url: current.tab.url, enable: e.target.checked });
            e.target.checked = !!r.enabled;
            toast(r.enabled ? `Stickies will show on ${r.origin.replace(/^https?:\/\//, '')}` : 'Turned off for this site');
        } catch (err) { e.target.checked = !e.target.checked; toast(err.message, true); }
    });
    // "All notes" is the root of the hierarchy; the header arrow is one level up
    $('#open-all').addEventListener('click', (e) => { e.preventDefault(); if (PANEL) showLibrary(true, { root: true }); else chrome.tabs.create({ url: chrome.runtime.getURL('src/options.html#notes') }); });
    $('#open-options').addEventListener('click', (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); });
    $('#open-detail').addEventListener('click', (e) => { e.preventDefault(); openDetail(); });
    const openPanel = async (e) => {
        e.preventDefault();
        if (!await flushDraft()) return;
        try {
            const w = await chrome.windows.getLastFocused();
            await chrome.sidePanel.open({ windowId: w.id });
            dismiss();
        } catch (err) { toast(err.message, true); }
    };
    $('#open-panel')?.addEventListener('click', openPanel);
    for (const id of ['#close-view', '#close-view-library']) $(id)?.addEventListener('click', async () => { if (await flushDraft()) dismiss(); });
    if (!PANEL || EMBED) {
        // Esc closes the popup and the widget. The side panel stays: a stray
        // Esc while writing must not take the whole panel away.
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { flushDraft().then((saved) => { if (saved) dismiss(); }); } });
    }
    if (PANEL) {
        $('#browse-notes').addEventListener('click', () => showLibrary());
        $('#library-up').addEventListener('click', () => { library?.up(); });
        $('#return-to-page').addEventListener('click', (e) => { e.preventDefault(); showLibrary(false); });
        const windowId = async () => (await chrome.windows.getCurrent()).id;
        let switchTimer = null;
        const follow = () => { clearTimeout(switchTimer); switchTimer = setTimeout(() => refresh({ capture: false }), 150); };
        if (EMBED) {
            // bound to the tab around us; follow in-page navigations (pushState) of that tab
            chrome.tabs.onUpdated.addListener((tabId, info) => { if (tabId === ownTabId && (info.url || info.status === 'complete')) follow(); });
            window.addEventListener('message', (e) => {
                if (e.source !== window.parent || e.data?.type !== 'pn:shown') return;
                refresh({ capture: false }).then(() => { if (!libraryVisible) editor.focus(); });
            });
        } else {
            // follow the active tab: save what is being typed, then show the new page
            chrome.tabs.onActivated.addListener(async (info) => { if (info.windowId === await windowId()) follow(); });
            chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => { if (tab.active && (info.url || info.status === 'complete') && tab.windowId === await windowId()) follow(); });
        }
        // a note saved from the popup, the page or the context menu shows up here too
        let libraryTimer;
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area !== 'local') return;
            if (current?.ident && changes[`note:${current.ident.id}`]) refresh({ keepEditor: document.activeElement === editor, capture: false });
            if (changes['stickies:visible'] && current) { current.stickiesVisible = changes['stickies:visible'].newValue !== false; renderStickies(); }
            if (libraryVisible && changes['notes:index']) { clearTimeout(libraryTimer); libraryTimer = setTimeout(() => library.reload(), 150); }
        });
    }
    // The popup's open is the user's click on this tab: capture now. The panel
    // and the widget were opened by the worker, which already captured.
    const start = async () => {
        if (EMBED) ownTabId = (await chrome.tabs.getCurrent())?.id || (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0]?.id || null;
        await refresh({ capture: !PANEL });
        watchVaultFromPage();
        if (PANEL && !/^(https?|file):/.test(current?.tab?.url || '')) showLibrary();
        else { editor.focus(); editor.setSelectionRange(editor.value.length, editor.value.length); }
    };
    start();
}
init();
