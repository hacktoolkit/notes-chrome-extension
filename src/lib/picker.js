// Type-to-find picker over the saved pages. Loads the index once per open,
// filters as you type (every word must match the title, site, URL or the
// latest note), and is a keyboard-first combobox: arrows move, Enter picks,
// Esc closes. Used to link pages from the popup, the sidebar and All notes.
import { el, send } from './ui.js';
import { cleanTitle } from './notes.js';

export function matchRows(rows, query, { exclude = new Set() } = {}) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return rows
        .filter((r) => !exclude.has(r.id))
        .filter((r) => {
            const hay = `${cleanTitle(r.title)} ${r.host} ${r.url} ${r.preview || ''}`.toLowerCase();
            return words.every((w) => hay.includes(w));
        })
        .sort((a, b) => {
            // a title hit before a hit anywhere else, then most recent first
            const t = (r) => words.length && words.every((w) => cleanTitle(r.title).toLowerCase().includes(w)) ? 0 : 1;
            return t(a) - t(b) || b.updated.localeCompare(a.updated);
        });
}

export function createPagePicker({ placeholder = 'Type to find a page…', exclude = new Set(), limit = 8, onPick, onClose = () => {} }) {
    const listId = `picker-${Math.random().toString(36).slice(2, 8)}`;
    const input = el('input', { type: 'search', placeholder, role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false', 'aria-controls': listId, autocomplete: 'off', spellcheck: 'false' });
    const list = el('ul', { id: listId, class: 'picker-list', role: 'listbox' });
    const status = el('div', { class: 'picker-status muted', role: 'status' });
    const root = el('div', { class: 'picker' }, [input, list, status]);
    let rows = null, shown = [], active = -1, closed = false;

    function render() {
        const query = input.value.trim();
        shown = rows ? matchRows(rows, query, { exclude }).slice(0, limit) : [];
        list.replaceChildren();
        shown.forEach((r, i) => {
            list.append(el('li', { id: `${listId}-${i}`, role: 'option', 'aria-selected': String(i === active), class: i === active ? 'active' : '', onmousedown: (e) => { e.preventDefault(); pick(r); }, onmousemove: () => { if (active !== i) { active = i; render(); } } }, [
                el('span', { class: 'picker-title', text: cleanTitle(r.title) || r.url }),
                el('span', { class: 'picker-meta', text: [r.host, r.entries ? `${r.entries} ${r.entries === 1 ? 'entry' : 'entries'}` : '', r.stickies ? `${r.stickies} ${r.stickies === 1 ? 'sticky' : 'stickies'}` : ''].filter(Boolean).join(' · ') })
            ]));
        });
        input.setAttribute('aria-expanded', String(shown.length > 0));
        input.setAttribute('aria-activedescendant', active >= 0 && shown[active] ? `${listId}-${active}` : '');
        const total = rows ? matchRows(rows, query, { exclude }).length : 0;
        status.textContent = !rows ? 'Loading your pages…' : total === 0 ? (query ? 'No saved page matches.' : 'No other saved pages yet.') : total > shown.length ? `${shown.length} of ${total} pages, keep typing to narrow` : `${total} page${total === 1 ? '' : 's'}`;
    }
    function pick(row) { if (closed) return; closed = true; onPick(row); }
    function close() { if (closed) return; closed = true; onClose(); }
    input.addEventListener('input', () => { active = shown.length ? 0 : -1; render(); if (active === 0) render(); });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(shown.length - 1, active + 1); render(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); render(); }
        else if (e.key === 'Enter') { e.preventDefault(); if (shown[active]) pick(shown[active]); else if (shown.length === 1) pick(shown[0]); }
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    });
    input.addEventListener('blur', () => setTimeout(() => { if (!root.contains(document.activeElement)) close(); }, 120));
    render();
    send('list', {}).then((r) => { rows = r; active = r.length && matchRows(rows, '', { exclude }).length ? 0 : -1; render(); }).catch((e) => { rows = []; render(); status.textContent = e.message; });
    return { root, focus: () => input.focus(), close };
}
