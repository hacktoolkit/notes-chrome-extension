// The popup shows the note for the current page and sends every change to the
// service worker.

const $ = (sel) => document.querySelector(sel);
import { el, fmt, send } from './lib/ui.js';
const APP_NAME = chrome.runtime.getManifest().name;
let current = null; // { tab, ident, note, insights }



let toastTimer;
function toast(msg, error = false) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = `toast${error ? ' error' : ''}`;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2500);
}


function renderText(text) {
    // quotes ("> ") get a bar; everything else is plain text
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

function render() {
    const { tab, ident, note } = current || {};
    $('#empty').hidden = !!tab;
    $('#compose').hidden = !tab;
    $('#page-title').textContent = tab ? (note?.title || tab.title || tab.url) : APP_NAME;
    $('#page-url').textContent = tab ? tab.url : '';
    const rule = $('#rule');
    rule.hidden = !ident?.rule;
    rule.textContent = ident?.rule || '';
    rule.title = ident ? `This note follows the page: ${ident.key}` : '';

    const rem = $('#reminder');
    rem.hidden = !note?.remind;
    rem.innerHTML = '';
    if (note?.remind) {
        rem.append(`⏰ Reminder ${fmt(note.remind)}`, el('button', { class: 'ghost', text: 'Clear', onclick: () => setReminder({ when: null }) }));
    }

    $('#open-detail').hidden = !note;
    $('#capture').hidden = !tab || !!(note && note.snapshots && note.snapshots.length);
    renderInsights(current?.insights);

    const list = $('#entries');
    list.innerHTML = '';
    const entries = note?.entries || [];
    entries.map((e, i) => ({ ...e, i })).reverse().forEach((e) => {
        const li = el('li', { class: 'entry' });
        const when = el('div', { class: 'when' }, [fmt(e.at), e.edited ? el('span', { class: 'muted', text: '(edited)' }) : null]);
        const tools = el('span', { class: 'tools' }, [
            el('button', { class: 'ghost', text: 'Edit', onclick: () => editEntry(li, e) }),
            el('button', { class: 'ghost', text: 'Delete', onclick: () => removeEntry(e.i) })
        ]);
        when.append(tools);
        li.append(when, renderText(e.text));
        list.append(li);
    });
}

function renderInsights(ins) {
    const box = $('#insights');
    box.innerHTML = '';
    if (!ins) { box.hidden = true; return; }
    const rows = [];
    if (ins.edits?.length) {
        for (const e of ins.edits.slice(0, 3)) rows.push(el('div', { class: 'ins edit' }, [el('span', { class: 'tag', text: 'edited' }), e.text]));
    }
    if (ins.findings?.length) {
        for (const f of ins.findings.filter((x) => x.level === 'ask').slice(0, 3)) rows.push(el('div', { class: 'ins ask' }, [el('span', { class: 'tag', text: 'ask' }), f.text]));
    }
    if (ins.summary) {
        const s = ins.summary;
        rows.push(el('div', { class: 'ins summary' }, [
            el('span', {}, [el('b', { text: `${s.years} yrs` }), ' exp']),
            el('span', {}, [el('b', { text: String(s.employers) }), ' employers']),
            el('span', {}, [el('b', { text: `${Math.round(s.averageTenureMonths / 12 * 10) / 10} yrs` }), ' avg tenure']),
            el('a', { class: 'ghost', text: 'copy card', title: s.card, onclick: () => { navigator.clipboard.writeText(s.card); toast('Card line copied'); } })
        ]));
    } else if (ins.changed && (ins.changed.addedCount || ins.changed.removedCount || ins.changed.titleChanged)) {
        rows.push(el('div', { class: 'ins edit' }, [el('span', { class: 'tag', text: 'changed' }), `Page changed since ${fmt(ins.changed.since)}: ${ins.changed.addedCount} lines added, ${ins.changed.removedCount} removed.`]));
    }
    const extra = (ins.findings?.length || 0) + (ins.edits?.length || 0) - rows.filter((r) => !r.classList.contains('summary')).length;
    if (rows.length === 0 && ins.captures) rows.push(el('div', { class: 'more', text: `${ins.captures} capture${ins.captures === 1 ? '' : 's'} of this page kept locally.` }));
    else if (extra > 0 || ins.captures > 1) rows.push(el('div', { class: 'more' }, [el('a', { text: `${extra > 0 ? `${extra} more · ` : ''}${ins.captures} capture${ins.captures === 1 ? '' : 's'} · details`, onclick: openDetail })]));
    rows.forEach((r) => box.append(r));
    box.hidden = rows.length === 0;
}

function openDetail() {
    if (current?.note) chrome.tabs.create({ url: chrome.runtime.getURL(`src/note.html?id=${current.note.id}`) });
}

async function refresh() {
    try {
        current = await send('current');
    } catch (e) {
        current = null;
        toast(e.message, true);
    }
    render();
}

async function save() {
    const text = $('#entry').value.trim();
    if (!text) return;
    try {
        await send('addEntry', { tabId: current.tab.id, text });
        $('#entry').value = '';
        toast('Saved');
        await refresh();
    } catch (e) { toast(e.message, true); }
}

async function captureNow() {
    try {
        await send('capture', { tabId: current.tab.id });
        toast('Captured');
        await refresh();
    } catch (e) { toast(e.message, true); }
}

async function removeEntry(index) {
    try { await send('removeEntry', { id: current.note.id, index }); await refresh(); } catch (e) { toast(e.message, true); }
}

function editEntry(li, e) {
    const ta = el('textarea', { rows: 3 });
    ta.value = e.text;
    const row = el('div', { class: 'row' }, [
        el('button', { class: 'primary', text: 'Save', onclick: async () => { try { await send('updateEntry', { id: current.note.id, index: e.i, text: ta.value }); await refresh(); } catch (err) { toast(err.message, true); } } }),
        el('button', { text: 'Cancel', onclick: render })
    ]);
    li.querySelector('.text').replaceWith(ta);
    li.append(row);
    ta.focus();
}

async function setReminder({ preset, when }) {
    try {
        if (!current.note) {
            // a reminder needs a note; create one from whatever is typed, or a placeholder entry
            const text = $('#entry').value.trim() || 'Reminder set';
            await send('addEntry', { tabId: current.tab.id, text });
            $('#entry').value = '';
            await refresh();
        }
        await send('setReminder', { id: current.note.id, preset, when });
        $('#remind-menu').hidden = true;
        toast(preset || when ? 'Reminder set' : 'Reminder cleared');
        await refresh();
    } catch (e) { toast(e.message, true); }
}

async function snoozeTab() {
    const at = $('#remind-at').value;
    const text = $('#entry').value.trim();
    try {
        await send('snoozeTab', { tabId: current.tab.id, preset: at ? null : 'tomorrow', when: at ? new Date(at).toISOString() : null, text });
        window.close();
    } catch (e) { toast(e.message, true); }
}

function init() {
    $('#save').addEventListener('click', save);
    $('#capture').addEventListener('click', captureNow);
    $('#entry').addEventListener('keydown', (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') save(); });
    $('#remind-btn').addEventListener('click', (e) => {
        const m = $('#remind-menu');
        const r = e.currentTarget.getBoundingClientRect();
        m.style.left = `${Math.round(r.left)}px`;
        m.style.top = `${Math.round(r.bottom + 4)}px`;
        m.hidden = !m.hidden;
    });
    document.querySelectorAll('#remind-menu [data-preset]').forEach((b) => b.addEventListener('click', () => setReminder({ preset: b.dataset.preset })));
    $('#remind-at').addEventListener('change', (e) => { if (e.target.value) setReminder({ when: new Date(e.target.value).toISOString() }); });
    document.querySelector('#remind-menu .snooze').addEventListener('click', snoozeTab);
    document.addEventListener('click', (e) => { if (!e.target.closest('.menu')) $('#remind-menu').hidden = true; });
    $('#open-all').addEventListener('click', (e) => { e.preventDefault(); chrome.tabs.create({ url: chrome.runtime.getURL('src/options.html#notes') }); });
    $('#open-options').addEventListener('click', (e) => { e.preventDefault(); chrome.runtime.openOptionsPage(); });
    $('#open-detail').addEventListener('click', (e) => { e.preventDefault(); openDetail(); });
    refresh().then(() => $('#entry').focus());
}
init();
