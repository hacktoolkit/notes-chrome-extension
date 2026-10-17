// Note detail page: entries, insights, captures with diffs.
import { cleanTitle, toMarkdown } from './lib/notes.js';
import { fmtDate } from './lib/profile.js';

const $ = (sel) => document.querySelector(sel);
import { el, fmt, send } from './lib/ui.js';

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

    if (note.stickies?.length) {
        $('#sticky-section').hidden = false;
        note.stickies.forEach((s, i) => $('#stickies').append(el('li', { class: 'sticky-note' }, [
            el('div', { class: 'eyebrow', text: `Sticky ${i + 1}${s.found === false ? ' · location missing' : ''}` }),
            el('blockquote', { text: s.anchor?.quote?.exact || s.anchor?.label || 'Page element' }),
            el('div', { class: 'text', text: s.text || 'No comment yet' })
        ])));
    }

    const linked = await send('links', { id });
    if (linked.length) {
        $('#linked-section').hidden = false;
        for (const row of linked) {
            $('#linked').append(el('li', {}, [
                el('span', { class: 't' }, [
                    row.missing ? el('b', { class: 'muted', text: row.key }) : el('a', { href: `note.html?id=${row.id}`, text: cleanTitle(row.title) || row.url }),
                    el('span', { text: row.missing ? 'That page\'s note is gone' : `${row.host}${row.entries ? ` · ${row.entries} ${row.entries === 1 ? 'entry' : 'entries'}` : ''}${row.stickies ? ` · ${row.stickies} ${row.stickies === 1 ? 'sticky' : 'stickies'}` : ''}` })
                ]),
                row.url && !row.missing ? el('a', { href: row.url, target: '_blank', rel: 'noopener', class: 'muted', text: 'Open page ↗' }) : null
            ]));
        }
    }

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
