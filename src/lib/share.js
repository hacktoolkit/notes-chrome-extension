// Share stickies (and optionally the notes) for one page as a flat text file,
// no server: JSON, deflate-compressed, optionally encrypted with a passphrase
// (PBKDF2-SHA256 -> AES-256-GCM), base64, wrapped so it survives email and
// chat. Pure Web APIs only, so it runs in the worker, the pages and node.
//
//   -----BEGIN PAGE NOTES-----
//   pagenotes/1 deflate aes-gcm
//   <base64, 76 columns>
//   -----END PAGE NOTES-----

export const SHARE_BEGIN = '-----BEGIN PAGE NOTES-----';
export const SHARE_END = '-----END PAGE NOTES-----';
const VERSION = 'pagenotes/1';
const PBKDF2_ITERATIONS = 250000;

const enc = new TextEncoder();
const dec = new TextDecoder();

export function sharePayload(note, { includeEntries = false, now = new Date() } = {}) {
    return {
        v: 1,
        url: note.url,
        key: note.key,
        title: note.title,
        host: note.host,
        sharedAt: now.toISOString(),
        stickies: (note.stickies || []).map(({ id, anchor, text, created, updated }) => ({ id, anchor, text, created, updated })),
        ...(includeEntries ? { entries: note.entries.map(({ at, text }) => ({ at, text })) } : {})
    };
}

async function pipe(bytes, stream) {
    const out = new Blob([bytes]).stream().pipeThrough(stream);
    return new Uint8Array(await new Response(out).arrayBuffer());
}
const compress = (bytes) => pipe(bytes, new CompressionStream('deflate-raw'));
const decompress = (bytes) => pipe(bytes, new DecompressionStream('deflate-raw'));

function toBase64(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s);
}
function fromBase64(s) {
    const bin = atob(s.replace(/\s+/g, ''));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
}

async function deriveKey(passphrase, salt) {
    const material = await crypto.subtle.importKey('raw', enc.encode(passphrase.normalize('NFKC')), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encodeShare(payload, { passphrase = '' } = {}) {
    let bytes = await compress(enc.encode(JSON.stringify(payload)));
    let cipher = 'none';
    if (passphrase) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveKey(passphrase, salt);
        const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
        bytes = new Uint8Array(salt.length + iv.length + ct.length);
        bytes.set(salt, 0); bytes.set(iv, salt.length); bytes.set(ct, salt.length + iv.length);
        cipher = 'aes-gcm';
    }
    const b64 = toBase64(bytes).replace(/(.{76})/g, '$1\n').trimEnd();
    return [SHARE_BEGIN, `${VERSION} deflate ${cipher}`, b64, SHARE_END, ''].join('\n');
}

// What a text claims to be, before decoding: { cipher } or null if not ours.
export function inspectShare(text) {
    const m = /-----BEGIN PAGE NOTES-----\s*\n\s*pagenotes\/(\d+) (\S+) (\S+)\s*\n([\s\S]*?)-----END PAGE NOTES-----/.exec(text || '');
    if (!m) return null;
    return { version: Number(m[1]), compression: m[2], cipher: m[3], body: m[4] };
}

export async function decodeShare(text, { passphrase = '' } = {}) {
    const info = inspectShare(text);
    if (!info) throw new Error('This is not a Page Notes share.');
    if (info.version !== 1 || info.compression !== 'deflate') throw new Error('This share needs a newer version of the extension.');
    let bytes = fromBase64(info.body);
    if (info.cipher === 'aes-gcm') {
        if (!passphrase) throw new Error('This share is encrypted. Enter the passphrase.');
        const salt = bytes.slice(0, 16), iv = bytes.slice(16, 28), ct = bytes.slice(28);
        const key = await deriveKey(passphrase, salt);
        try { bytes = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)); } catch (e) { throw new Error('Wrong passphrase.'); }
    } else if (info.cipher !== 'none') throw new Error(`Unknown encryption "${info.cipher}".`);
    let payload;
    try { payload = JSON.parse(dec.decode(await decompress(bytes))); } catch (e) { throw new Error('The share is damaged.'); }
    if (!payload || payload.v !== 1 || !payload.url || !payload.key || !Array.isArray(payload.stickies)) throw new Error('The share is damaged.');
    return payload;
}

// Merge a received payload into the recipient's note for that page: stickies
// by id, entries by time and text, nothing overwritten.
export function applyShare(note, payload, now = new Date()) {
    const iso = now.toISOString();
    const stickies = [...(note.stickies || [])];
    let addedStickies = 0;
    for (const s of payload.stickies) {
        if (!s || !s.id || stickies.some((x) => x.id === s.id)) continue;
        stickies.push({ id: s.id, anchor: s.anchor || null, text: s.text || '', created: s.created || iso, updated: s.updated || iso });
        addedStickies++;
    }
    const entries = [...note.entries];
    let addedEntries = 0;
    const seen = new Set(entries.map((e) => `${e.at.slice(0, 16)}|${e.text}`));
    for (const e of payload.entries || []) {
        if (!e?.text || seen.has(`${String(e.at).slice(0, 16)}|${e.text}`)) continue;
        entries.push({ at: e.at || iso, text: e.text });
        addedEntries++;
    }
    entries.sort((a, b) => a.at.localeCompare(b.at));
    const changed = addedStickies || addedEntries;
    return { note: changed ? { ...note, stickies, entries, updated: iso } : note, addedStickies, addedEntries };
}

export function shareFileName(note) {
    return `${(note.title || 'page').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'page'}-stickies.pagenotes.txt`;
}
