// Pure note model: one note per canonical page, dated entries inside it,
// Markdown with YAML frontmatter as the interchange format (Obsidian-friendly).
// No Chrome APIs here.

import { canonicalize, hostOf } from './url.js';

export const NOTE_VERSION = 1;

// Stable id for a canonical key: short hash, safe for storage keys and filenames.
export function noteId(key) {
    let h1 = 0x811c9dc5;
    let h2 = 0x01000193;
    for (let i = 0; i < key.length; i++) {
        const c = key.charCodeAt(i);
        h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
        h2 = Math.imul(h2 ^ c, 0x811c9dc5) >>> 0;
    }
    return (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')).slice(0, 12);
}

export function identify(url, compiledRules, normalization) {
    const { key, rule } = canonicalize(url, compiledRules, normalization);
    return { key, rule, id: noteId(key) };
}

export function newNote({ url, title, key, rule, now = new Date() }) {
    const iso = now.toISOString();
    return {
        version: NOTE_VERSION,
        id: noteId(key),
        key,
        rule: rule || null,
        url,
        title: title || url,
        host: hostOf(url) || '',
        tags: [],
        created: iso,
        updated: iso,
        remind: null,
        entries: [],
        snapshot: null,
        snapshots: []
    };
}

export function addEntry(note, text, now = new Date()) {
    const body = (text || '').trim();
    if (!body) return note;
    const iso = now.toISOString();
    return { ...note, updated: iso, entries: [...note.entries, { at: iso, text: body }] };
}

export function updateEntry(note, index, text, now = new Date()) {
    const entries = note.entries.map((e, i) => (i === index ? { ...e, text: (text || '').trim(), edited: now.toISOString() } : e));
    return { ...note, updated: now.toISOString(), entries: entries.filter((e) => e.text) };
}

export function removeEntry(note, index, now = new Date()) {
    return { ...note, updated: now.toISOString(), entries: note.entries.filter((_, i) => i !== index) };
}

export function setReminder(note, when, now = new Date()) {
    return { ...note, updated: now.toISOString(), remind: when ? new Date(when).toISOString() : null };
}

export const SNAPSHOT_LIMIT = 12;

function textHash(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
    return h.toString(16);
}

// Snapshots are what the page looked like when you were there. The newest is
// also mirrored in `snapshot` for older readers. Identical captures (same text)
// only bump the newest snapshot's `seen` time, so history stays meaningful.
export function addSnapshot(note, capture, now = new Date()) {
    if (!capture || !capture.text) return note;
    const iso = now.toISOString();
    const hash = textHash(`${capture.title || ''}\n${capture.text}`);
    const history = [...(note.snapshots || [])];
    const last = history[history.length - 1];
    if (last && last.hash === hash) {
        history[history.length - 1] = { ...last, seen: iso };
    } else {
        history.push({ at: iso, seen: iso, hash, title: capture.title || '', description: capture.description || '', text: capture.text, meta: capture.meta || null, structured: capture.structured || null });
        while (history.length > SNAPSHOT_LIMIT) history.splice(1, 1); // keep the first ever and the recent ones
    }
    const newest = history[history.length - 1];
    return { ...note, snapshots: history, snapshot: { at: newest.at, text: newest.text, title: newest.title, description: newest.description } };
}

export function setSnapshot(note, snapshot, now = new Date()) {
    return addSnapshot(note, snapshot, now);
}

// ----- Markdown ------------------------------------------------------------

function yamlString(v) {
    const s = String(v ?? '');
    return /^[\w./:+-]*$/.test(s) && s !== '' ? s : JSON.stringify(s);
}

function fmtStamp(iso) {
    // local wall-clock stamp for headings: YYYY-MM-DD HH:MM
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function slugify(s) {
    return (s || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'note';
}

export function fileNameFor(note) {
    return `${slugify(note.title)}-${note.id}.md`;
}

export function toMarkdown(note) {
    const lines = ['---'];
    lines.push(`title: ${yamlString(note.title)}`);
    lines.push(`url: ${yamlString(note.url)}`);
    lines.push(`key: ${yamlString(note.key)}`);
    if (note.rule) lines.push(`rule: ${yamlString(note.rule)}`);
    lines.push(`created: ${note.created}`);
    lines.push(`updated: ${note.updated}`);
    if (note.tags.length) lines.push(`tags: [${note.tags.map(yamlString).join(', ')}]`);
    if (note.remind) lines.push(`remind: ${note.remind}`);
    if (note.snapshot?.text) lines.push(`excerpt: ${JSON.stringify(note.snapshot.text.slice(0, 280))}`);
    lines.push('app: page-notes');
    lines.push('---', '');
    for (const e of [...note.entries].reverse()) {
        lines.push(`## ${fmtStamp(e.at)}`, '', e.text, '');
    }
    return lines.join('\n');
}

function parseYamlValue(raw) {
    const v = raw.trim();
    if (v.startsWith('"')) {
        try { return JSON.parse(v); } catch (e) { return v.slice(1, -1); }
    }
    if (v.startsWith('[') && v.endsWith(']')) {
        return v.slice(1, -1).split(',').map((x) => parseYamlValue(x)).filter((x) => x !== '');
    }
    return v;
}

// Parses a Markdown note. Headings "## YYYY-MM-DD HH:MM" start dated entries;
// text before the first heading becomes an undated entry stamped at `created`.
export function fromMarkdown(text) {
    const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text.replace(/\r\n/g, '\n'));
    if (!m) throw new Error('Missing frontmatter');
    const meta = {};
    for (const line of m[1].split('\n')) {
        const i = line.indexOf(':');
        if (i > 0) meta[line.slice(0, i).trim()] = parseYamlValue(line.slice(i + 1));
    }
    if (!meta.url || !meta.key) throw new Error('Frontmatter needs url and key');
    const body = m[2];
    const entries = [];
    const re = /^## (\d{4}-\d{2}-\d{2})(?: (\d{2}:\d{2}))?\s*$/gm;
    let last = null;
    let match;
    const pushEntry = (at, chunk) => {
        const t = chunk.trim();
        if (t) entries.push({ at, text: t });
    };
    const preamble = body.slice(0, (re.exec(body) || { index: body.length }).index);
    re.lastIndex = 0;
    pushEntry(meta.created || new Date().toISOString(), preamble);
    while ((match = re.exec(body))) {
        if (last) pushEntry(last.at, body.slice(last.end, match.index));
        const at = new Date(`${match[1]}T${match[2] || '00:00'}:00`).toISOString();
        last = { at, end: match.index + match[0].length };
    }
    if (last) pushEntry(last.at, body.slice(last.end));
    entries.sort((a, b) => a.at.localeCompare(b.at));
    return {
        version: NOTE_VERSION,
        id: noteId(meta.key),
        key: meta.key,
        rule: meta.rule || null,
        url: meta.url,
        title: meta.title || meta.url,
        host: hostOf(meta.url) || '',
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        created: meta.created || entries[0]?.at || new Date().toISOString(),
        updated: meta.updated || entries[entries.length - 1]?.at || new Date().toISOString(),
        remind: meta.remind || null,
        entries,
        snapshot: meta.excerpt ? { at: meta.updated || null, text: meta.excerpt } : null,
        snapshots: []
    };
}

// Merge an imported note into an existing one: union of entries by timestamp+text.
export function mergeNotes(existing, incoming) {
    if (!existing) return incoming;
    const seen = new Set(existing.entries.map((e) => `${e.at}|${e.text}`));
    const entries = [...existing.entries];
    for (const e of incoming.entries) {
        if (!seen.has(`${e.at}|${e.text}`)) entries.push(e);
    }
    entries.sort((a, b) => a.at.localeCompare(b.at));
    return {
        ...existing,
        title: incoming.updated > existing.updated ? incoming.title : existing.title,
        tags: [...new Set([...existing.tags, ...incoming.tags])],
        updated: [existing.updated, incoming.updated].sort().pop(),
        remind: incoming.remind || existing.remind,
        snapshot: existing.snapshot || incoming.snapshot,
        snapshots: existing.snapshots?.length ? existing.snapshots : incoming.snapshots || [],
        entries
    };
}

// ----- search / summaries --------------------------------------------------

export function indexEntry(note) {
    const last = note.entries[note.entries.length - 1];
    return {
        id: note.id,
        key: note.key,
        url: note.url,
        title: note.title,
        host: note.host,
        updated: note.updated,
        remind: note.remind,
        entries: note.entries.length,
        captures: (note.snapshots || []).length,
        rule: note.rule || null,
        preview: (last?.text || '').slice(0, 120)
    };
}

export function matchesQuery(note, query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return true;
    const hay = [note.title, note.url, note.host, note.tags.join(' '), ...note.entries.map((e) => e.text)].join('\n').toLowerCase();
    return q.split(/\s+/).every((term) => hay.includes(term));
}

// Snooze presets, relative to `now`: returns an ISO timestamp.
export function presetTime(preset, now = new Date()) {
    const d = new Date(now);
    switch (preset) {
        case '1h': d.setHours(d.getHours() + 1); break;
        case '3h': d.setHours(d.getHours() + 3); break;
        case 'tonight': d.setHours(18, 0, 0, 0); if (d <= now) d.setDate(d.getDate() + 1); break;
        case 'tomorrow': d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); break;
        case 'nextweek': d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7)); d.setHours(9, 0, 0, 0); break;
        default: return null;
    }
    return d.toISOString();
}
