// Note detail page: entries, insights, captures with diffs.
import { toMarkdown } from './lib/notes.js';
import { fmtDate } from './lib/profile.js';

const $ = (sel) => document.querySelector(sel);
function send(type, args = {}) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type, args }, (r) => {
            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
            else if (!r || !r.ok) reject(new Error(r?.error || 'No response'));
            else resolve(r.result);
        });
    });
}
function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
        else if (v !== undefined && v !== null && v !== false) node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of [].concat(children)) if (c !== null && c !== undefined) node.append(c.nodeType ? c : document.createTextNode(c));
    return node;
}
function fmt(iso) {
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function renderFindings(target, items, cls, tag) {
    for (const f of items) target.append(el('div', { class: `finding ${cls}` }, [el('span', { class: 'tag', text: tag }), el('span', { text: f.text })]));
}

async function init() {
    const id = new URLSearchParams(location.search).get('id');
    const { note, insights } = await send('detail', { id });
    document.title = note.title;
    $('#title').textContent = note.title;
    $('#url').textContent = note.url;
    $('#url').href = note.url;
    const m = insights?.meta || {};
    const metaBits = [note.host, m.siteName, m.author && `by ${m.author}`, m.published && `published ${m.published.slice(0, 10)}`, note.rule && `identity: ${note.key}`].filter(Boolean);
    $('#meta').textContent = metaBits.join(' · ');
    $('#copy-md').addEventListener('click', () => navigator.clipboard.writeText(toMarkdown(note)));

    if (insights && (insights.summary || insights.findings?.length || insights.edits?.length)) {
        $('#insights').hidden = false;
        if (insights.summary) {
            const s = insights.summary;
            $('#summary').append(
                el('span', {}, [el('b', { text: `${s.years} yrs` }), ' experience']),
                el('span', {}, [el('b', { text: `${s.employers}` }), ' employers']),
                el('span', {}, [el('b', { text: `${Math.round(s.averageTenureMonths / 12 * 10) / 10} yrs` }), ' average tenure']),
                el('span', {}, [el('b', { text: `${s.currentRoles}` }), ' current role', s.currentRoles === 1 ? '' : 's'])
            );
            $('#copy-card').hidden = false;
            $('#copy-card').addEventListener('click', () => navigator.clipboard.writeText(s.card));
        }
        if (insights.edits?.length) renderFindings($('#edits'), insights.edits, 'edit', 'edited');
        if (insights.findings?.length) {
            renderFindings($('#findings'), insights.findings.filter((f) => f.level === 'ask'), 'ask', 'ask');
            renderFindings($('#findings'), insights.findings.filter((f) => f.level !== 'ask'), 'info', 'info');
        }
        if (insights.profile?.experience?.length) {
            const table = el('table', {}, [el('thead', {}, [el('tr', {}, ['Role', 'Employer', 'Type', 'From', 'To'].map((h) => el('th', { text: h })))])]);
            const body = el('tbody');
            for (const p of insights.profile.experience) body.append(el('tr', {}, [p.title, p.company, p.type || '', fmtDate(p.start), fmtDate(p.end)].map((v) => el('td', { text: v }))));
            table.append(body);
            $('#experience').append(el('div', { class: 'exp' }, [table]));
        }
    }

    if (insights?.changed && (insights.changed.addedCount || insights.changed.removedCount || insights.changed.titleChanged)) {
        $('#changed').hidden = false;
        const c = insights.changed;
        const body = $('#changed-body');
        body.append(el('p', { class: 'muted', text: `Compared with the capture from ${fmt(c.since)}: ${c.addedCount} lines added, ${c.removedCount} removed${c.titleChanged ? ', title changed' : ''}.` }));
        const diff = el('div', { class: 'diff' });
        c.removed.forEach((l) => diff.append(el('div', { class: 'del', text: `− ${l}` })));
        c.added.forEach((l) => diff.append(el('div', { class: 'add', text: `+ ${l}` })));
        body.append(diff);
    }

    const entries = $('#entries');
    [...note.entries].reverse().forEach((e) => entries.append(el('li', { class: 'entry' }, [el('div', { class: 'when', text: fmt(e.at) }), el('div', { class: 'text', text: e.text })])));
    if (note.entries.length === 0) entries.append(el('li', { class: 'empty', text: 'No entries.' }));

    const caps = note.snapshots || [];
    $('#capture-count').textContent = String(caps.length);
    const holder = $('#captures');
    if (caps.length === 0) holder.append(el('div', { class: 'empty', text: 'No captures yet. Open the popup on the page to take one.' }));
    [...caps].reverse().forEach((c, i) => {
        const d = el('details', { class: 'cap' }, [
            el('summary', {}, [el('b', { text: fmt(c.at) }), c.seen && c.seen !== c.at ? el('span', { class: 'muted', text: `seen again ${fmt(c.seen)}` }) : null, el('span', { class: 'muted', text: `${c.title || ''} · ${(c.text || '').length} chars${c.structured?.kind ? ` · ${c.structured.kind}` : ''}` })]),
            el('pre', { text: c.text || '' })
        ]);
        if (i === 0) d.open = true;
        holder.append(d);
    });
}
init().catch((e) => { document.body.textContent = e.message; });
