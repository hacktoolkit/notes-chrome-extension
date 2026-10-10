// The popup shows the note for the current page and sends every change to the
// service worker.

const $ = (sel) => document.querySelector(sel);
import { el, fmt, send } from './lib/ui.js';
const APP_NAME = chrome.runtime.getManifest().name;
let current = null; // { tab, ident, note, insights, today }
let draftTimer = null;
let lastSentText = null;

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

function openDetail() {
    if (current?.note) chrome.tabs.create({ url: chrome.runtime.getURL(`src/note.html?id=${current.note.id}`) });
}

function render({ keepEditor = false } = {}) {
    const { tab, ident, note, today } = current || {};
    $('#empty').hidden = !!tab;
    $('#compose').hidden = !tab;
    $('#page-title').textContent = tab ? (note?.title || tab.title || tab.url) : APP_NAME;
    $('#page-url').textContent = tab ? tab.url.replace(/^https?:\/\//, '') : '';
    const fav = $('#fav');
    fav.src = tab?.favIconUrl && !tab.favIconUrl.startsWith('chrome://') ? tab.favIconUrl : '../img/icon32.png';
    const rule = $('#rule');
    rule.hidden = !ident?.rule;
    rule.textContent = ident?.rule || '';
    rule.title = ident ? `This note follows the page: ${ident.key}` : '';
    $('#open-detail').hidden = !note;

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

async function refresh(opts) {
    try {
        current = await send('current', { tabId: current?.tab?.id });
    } catch (e) {
        current = null;
        toast(e.message, true);
    }
    render(opts);
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
    const text = $('#entry').value;
    if (text === lastSentText || !current?.tab) return;
    lastSentText = text;
    try {
        const r = await send('draft', { tabId: current.tab.id, text });
        current = { ...current, note: r.note, today: r.today };
        setStatus(text.trim() ? `Saved ${fmt(new Date().toISOString()).slice(11)}` : '', 'saved');
        render({ keepEditor: true });
    } catch (e) {
        setStatus(e.message, 'error');
    }
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
        await flushDraft();
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
        await flushDraft();
        await send('snoozeTab', { tabId: current.tab.id, preset: 'tomorrow' });
        window.close();
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
    $('#open-all').addEventListener('click', (e) => { e.preventDefault(); chrome.tabs.create({ url: chrome.runtime.getURL('src/options.html#notes') }); });
    $('#open-options').addEventListener('click', (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); });
    $('#open-detail').addEventListener('click', (e) => { e.preventDefault(); openDetail(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { flushDraft().then(() => window.close()); } });
    refresh().then(() => { editor.focus(); editor.setSelectionRange(editor.value.length, editor.value.length); });
}
init();
