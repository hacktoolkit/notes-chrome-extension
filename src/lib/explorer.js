// Shared saved-page browser. Selection stays in the view; only explicit Open
// actions create tabs. All note reads and mutations go through the worker.
//
// Navigation is a hierarchy, Sites > Pages > Page, and never a toggle. On a
// wide layout all three columns show; on a narrow one only the current level
// does, and up() climbs one level. The trail is a breadcrumb to any ancestor.
import { el, fmt, send } from './ui.js';
import { cleanTitle } from './notes.js';
import { createPagePicker } from './picker.js';

const count = (n, word) => `${n} ${n === 1 ? word : ({ entry: 'entries', sticky: 'stickies' }[word] || `${word}s`)}`;
function summary(row) {
    return [row.entries && count(row.entries, 'entry'), row.stickies && count(row.stickies, 'sticky'), row.captures && count(row.captures, 'capture')].filter(Boolean).join(' · ') || 'Empty page';
}

export function createExplorer(root, { search, includeCaptures, onCount = () => {}, onChange = () => {}, onNavigate = () => {} } = {}) {
    root.classList.add('explorer');
    let rows = [], host = '', selected = null, revision = 0, detailRevision = 0;
    let level = 0; // 0 sites, 1 pages of the chosen site, 2 the chosen page
    let trailTitle = '', trailSite = '';
    function setLevel(next) {
        level = Math.max(0, Math.min(2, next));
        if (level === 2 && !selected) level = 1;
        root.dataset.level = String(level);
        renderTrail(trailTitle);
        const visible = rows.filter((r) => !host || r.host === host);
        onNavigate(level, { host, title: trailTitle, site: trailSite, pages: visible.length, sites: new Set(rows.map((r) => r.host)).size });
    }
    if (!search) {
        search = el('input', { type: 'search', placeholder: 'Find a page or note…', 'aria-label': 'Search saved notes' });
        includeCaptures = el('input', { type: 'checkbox' });
        root.append(el('div', { class: 'explorer-search' }, [search, el('label', {}, [includeCaptures, ' Include capture-only pages'])]));
    }
    const message = el('div', { class: 'explorer-message', role: 'status', hidden: true });
    const siteList = el('div', { class: 'explorer-list', 'aria-label': 'Sites' });
    const pageList = el('div', { class: 'explorer-list', 'aria-label': 'Saved pages' });
    const siteLabel = el('summary', { text: 'Sites' });
    const pageLabel = el('summary', { text: 'Pages' });
    const sites = el('details', { class: 'explorer-column explorer-sites', open: true }, [siteLabel, siteList]);
    const pages = el('details', { class: 'explorer-column explorer-pages', open: true }, [pageLabel, pageList]);
    const preview = el('article', { class: 'explorer-preview', 'aria-label': 'Selected page', 'aria-live': 'polite' });
    const trail = el('nav', { class: 'explorer-trail', 'aria-label': 'Where you are' });
    root.append(message, trail, el('div', { class: 'explorer-columns' }, [sites, pages, preview]));
    root.dataset.level = '0';
    // the columns are always open; the narrow layout shows one level at a time
    for (const label of [siteLabel, pageLabel]) label.addEventListener('click', (e) => e.preventDefault());

    function renderTrail(title) {
        const crumbs = [el('button', { class: 'crumb', text: 'All sites', 'aria-current': level === 0 ? 'page' : null, onclick: () => setLevel(0) })];
        if (host || level >= 1) crumbs.push(el('button', { class: 'crumb', text: host || 'All pages', 'aria-current': level === 1 ? 'page' : null, onclick: () => setLevel(1) }));
        if (title && level === 2) crumbs.push(el('span', { class: 'crumb current', text: title, 'aria-current': 'page' }));
        trail.replaceChildren();
        crumbs.forEach((c, i) => { if (i) trail.append(el('span', { class: 'sep', text: '›', 'aria-hidden': 'true' })); trail.append(c); });
    }

    // Arrow keys move through the buttons in either navigation column.
    for (const list of [siteList, pageList]) list.addEventListener('keydown', (e) => {
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
        const buttons = [...list.querySelectorAll('button')];
        const index = buttons.indexOf(document.activeElement);
        if (index < 0) return;
        e.preventDefault();
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, index + (e.key === 'ArrowDown' ? 1 : -1)));
        buttons[next]?.focus();
    });

    function error(e) { message.hidden = false; message.textContent = e.message; }
    function action(text, fn, className = '') {
        return el('button', { text, class: className, onclick: async (e) => {
            e.currentTarget.disabled = true;
            try { await fn(); } catch (err) { error(err); }
            finally { e.target.disabled = false; }
        } });
    }
    function renderSites() {
        const hosts = new Map();
        for (const row of rows) hosts.set(row.host, (hosts.get(row.host) || 0) + 1);
        if (host && !hosts.has(host)) host = '';
        siteList.replaceChildren();
        for (const [name, total] of [['', rows.length], ...[...hosts].sort(([a], [b]) => a.localeCompare(b))]) {
            siteList.append(el('button', { class: `explorer-site${host === name ? ' selected' : ''}`, 'aria-pressed': String(host === name), 'data-host': name, onclick: () => {
                host = name;
                renderSites(); renderPages();
                setLevel(1);
            } }, [el('span', { class: 'explorer-folder', text: name ? '▱' : '▦', 'aria-hidden': 'true' }), el('span', { class: 'explorer-label', text: name || 'All sites' }), el('span', { class: 'explorer-count', text: String(total) })]));
        }
        siteLabel.textContent = host || 'Sites';
    }
    function renderPages() {
        const visible = rows.filter((r) => !host || r.host === host);
        if (!visible.some((r) => r.id === selected)) selected = visible[0]?.id || null;
        pageLabel.textContent = `${host || 'All pages'} · ${visible.length}`;
        pageList.replaceChildren();
        // across all sites, pages are listed by site
        const grouped = host ? [['', visible]] : [...visible.reduce((m, r) => m.set(r.host, [...(m.get(r.host) || []), r]), new Map())].sort(([a], [b]) => a.localeCompare(b));
        for (const [site, group] of grouped) {
            if (site) pageList.append(el('div', { class: 'explorer-group', role: 'heading', 'aria-level': '3' }, [el('span', { class: 'explorer-folder', text: '▱', 'aria-hidden': 'true' }), el('span', { class: 'explorer-label', text: site }), el('span', { class: 'explorer-count', text: String(group.length) })]));
            for (const row of group) {
            const button = el('button', { class: `explorer-page${row.id === selected ? ' selected' : ''}`, 'data-id': row.id, 'aria-pressed': String(row.id === selected), title: cleanTitle(row.title), onclick: () => {
                selected = row.id;
                for (const b of pageList.querySelectorAll('button')) { b.classList.toggle('selected', b.dataset.id === selected); b.setAttribute('aria-pressed', String(b.dataset.id === selected)); }
                showDetail(row.id);
                setLevel(2);
            } }, [el('span', { class: 'explorer-page-title', text: cleanTitle(row.title) || row.url }), el('span', { class: 'explorer-page-meta', text: summary(row) }), el('span', { class: 'explorer-page-excerpt', text: row.preview || row.host })]);
            pageList.append(button);
            }
        }
        if (selected) showDetail(selected);
        else {
            ++detailRevision;
            preview.replaceChildren(el('div', { class: 'explorer-empty' }, [el('b', { text: search.value ? 'No matching notes' : 'Your notebook starts here' }), el('p', { text: search.value ? 'Try a page title, a quote or a word from your notes.' : 'Open a page and click the toolbar icon to write your first note.' })]));
            trailTitle = ''; trailSite = '';
            if (level === 2) setLevel(1); else renderTrail();
        }
    }
    async function showDetail(id) {
        const version = ++detailRevision;
        preview.replaceChildren(el('p', { class: 'muted', text: 'Loading notes…' }));
        try {
            const note = await send('get', { id });
            if (version !== detailRevision) return;
            if (!note) { await reload(); return; }
            trailTitle = cleanTitle(note.title);
            trailSite = note.host || '';
            // the page arrived after the level did: tell the host again
            if (level === 2) setLevel(2); else renderTrail(trailTitle);
            const actions = el('div', { class: 'explorer-actions' }, [
                action('Open page ↗', () => send('openNote', { id, page: true }), 'primary'),
                action('Full details', () => send('openNote', { id }))
            ]);
            preview.replaceChildren(el('div', { class: 'explorer-preview-head' }, [el('span', { class: 'eyebrow', text: 'Saved page' }), el('h3', { text: cleanTitle(note.title) }), el('div', { class: 'explorer-url', text: note.url }), actions]));
            const addSection = (title, items, type, content) => {
                if (!items.length) return;
                preview.append(el('h4', { text: `${title} · ${items.length}` }));
                items.forEach((item, i) => {
                    const { label, excerpt, body } = content(item, i);
                    preview.append(el('details', { class: `explorer-item ${type}`, open: i === 0 }, [el('summary', {}, [el('span', { class: 'explorer-item-label', text: label }), el('span', { class: 'explorer-item-excerpt', text: excerpt })]), body]));
                });
            };
            // linked pages: click one to move to it here; + Link opens the picker
            const linked = await send('links', { id });
            if (version !== detailRevision) return;
            const linkBox = el('div', { class: 'explorer-links' });
            const linkHead = el('h4', { text: `Linked pages · ${linked.length}` });
            const linkList = el('ul', { class: 'explorer-link-list' });
            for (const row of linked) {
                linkList.append(el('li', { class: row.missing ? 'missing' : '' }, [
                    el('button', { class: 'explorer-link', disabled: row.missing || undefined, title: row.missing ? 'That page\'s note is gone' : 'Show this page', onclick: () => show(row.id) }, [el('span', { class: 'host', text: row.host || '·' }), el('span', { class: 'title', text: cleanTitle(row.title) || row.url || row.key })]),
                    action('Unlink', async () => { await send('unlink', { id, otherId: row.id }); await showDetail(id); }, 'ghost tiny')
                ]));
            }
            const pickerHolder = el('div', { class: 'explorer-picker', hidden: true });
            let picker = null;
            const closePicker = () => { picker = null; pickerHolder.hidden = true; pickerHolder.replaceChildren(); addLink.setAttribute('aria-expanded', 'false'); };
            const addLink = el('button', { class: 'tiny', text: '+ Link a page', 'aria-expanded': 'false', title: 'Connect this page to another saved page, on any site', onclick: () => {
                if (picker) { closePicker(); return; }
                picker = createPagePicker({ exclude: new Set([id, ...linked.map((r) => r.id)]), placeholder: 'Type to find a page to link…', onPick: async (row) => {
                    closePicker();
                    try { await send('link', { id, otherId: row.id }); await showDetail(id); onChange(); } catch (e) { error(e); }
                }, onClose: closePicker });
                pickerHolder.replaceChildren(picker.root); pickerHolder.hidden = false; addLink.setAttribute('aria-expanded', 'true'); picker.focus();
            } });
            linkHead.append(' ', addLink);
            linkBox.append(linkHead, pickerHolder, linkList);
            if (!linked.length) linkList.append(el('li', { class: 'muted', text: 'Nothing linked yet. Connect this page to another saved page, on any site.' }));
            preview.append(linkBox);
            addSection('Notes', [...note.entries].reverse(), 'note-entry', (e) => ({ label: fmt(e.at), excerpt: e.text, body: el('div', { class: 'explorer-body', text: e.text }) }));
            addSection('On the page', note.stickies || [], 'sticky', (s, i) => ({ label: `Sticky ${i + 1}${s.found === false ? ' · location missing' : ''}`, excerpt: s.text || 'No comment yet', body: el('div', { class: 'explorer-body' }, [el('blockquote', { text: s.anchor?.quote?.exact || s.anchor?.label || 'Page element' }), el('p', { text: s.text || 'No comment yet' })]) }));
            if (note.stickies?.length) preview.append(action('Copy feedback', async () => navigator.clipboard.writeText(await send('feedback', { id }))));
            addSection('Captures', [...(note.snapshots || [])].reverse(), 'capture', (c) => ({ label: fmt(c.at), excerpt: cleanTitle(c.title) || 'Page capture', body: el('div', { class: 'explorer-body', text: c.text || 'No page text.' }) }));
            if (!note.entries.length && !note.stickies?.length) preview.append(el('p', { class: 'muted', text: 'A saved capture. Open the page to add your own notes.' }));
            preview.append(el('div', { class: 'explorer-bottom' }, [el('span', { text: `Updated ${fmt(note.updated)}` }), action('Delete page notes', async () => {
                if (!confirm(`Delete all notes for “${cleanTitle(note.title)}”?`)) return;
                await send('deleteNote', { id }); await reload(); onChange();
            }, 'ghost')]));
        } catch (e) { if (version === detailRevision) { preview.replaceChildren(); error(e); } }
    }
    async function reload() {
        const version = ++revision;
        ++detailRevision;
        try {
            const result = await send('list', { query: search.value, includeCaptures: includeCaptures.checked });
            if (version !== revision) return;
            rows = result; message.hidden = true;
            onCount(rows.length); renderSites(); renderPages();
        } catch (e) { if (version === revision) error(e); }
    }
    // Climb one level; false at the top so the host can hide its back control.
    function up() {
        if (level === 0) return false;
        setLevel(level - 1);
        return true;
    }
    // Land on a site's page list, with one of its pages highlighted: where the
    // sidebar's back arrow arrives from the page it was showing.
    function focus({ host: wantHost = '', id = null } = {}) {
        const known = rows.some((r) => r.host === wantHost);
        host = known ? wantHost : '';
        if (id && rows.some((r) => r.id === id)) selected = id;
        renderSites(); renderPages();
        setLevel(known ? 1 : 0);
    }
    // Jump to a page by id: its site becomes the filter if the current one hides it.
    function show(id) {
        const row = rows.find((r) => r.id === id);
        if (!row) return false;
        if (host && row.host !== host) host = row.host;
        selected = id;
        renderSites(); renderPages();
        setLevel(2);
        return true;
    }
    search.addEventListener('input', () => { reload().then(() => { if (search.value && level === 0) setLevel(1); }); });
    includeCaptures.addEventListener('change', reload);
    return { reload, up, focus, show, depth: () => level };
}
