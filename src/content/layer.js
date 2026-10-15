// The in-page layer: numbered pins on annotated elements, a popover to read
// and edit, and a pick mode to add a sticky to any element. Everything lives
// in a shadow root so page styles and ours never touch.

import { describe, resolve } from '../lib/anchor.js';

const APP = chrome.runtime.getManifest().name;

const CSS = `
:host { all: initial; }
* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.pin { position: absolute; z-index: 2147483000; width: 22px; height: 22px; border-radius: 999px; background: #4f5bd5; color: #fff; font: 600 11px/22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; box-shadow: 0 2px 6px rgba(23,25,42,.3), 0 0 0 2px #fff; cursor: pointer; user-select: none; transition: transform .12s ease; }
.pin:hover { transform: scale(1.12); }
.pin.orphan { background: #b7791f; }
.pin.open { background: #3f49bd; }
.ring { position: absolute; z-index: 2147482999; pointer-events: none; border: 2px solid #4f5bd5; border-radius: 6px; box-shadow: 0 0 0 4px rgba(79,91,213,.12); }
.ring.pick { border-color: #4f5bd5; background: rgba(79,91,213,.07); }
.pop { position: absolute; z-index: 2147483001; width: 280px; background: #fff; color: #17192a; border-radius: 12px; box-shadow: 0 2px 4px rgba(23,25,42,.06), 0 20px 48px rgba(23,25,42,.18); border: 1px solid #e3e5ee; padding: 10px 12px 10px; }
.pop .q { font-size: 11px; color: #6c7189; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px; }
.pop .q b { color: #4f5bd5; margin-right: 6px; }
.pop textarea { width: 100%; min-height: 64px; resize: none; border: 0; padding: 0; font-size: 13px; line-height: 1.45; color: #17192a; background: transparent; outline: none; }
.pop .row { display: flex; align-items: center; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e3e5ee; font-size: 11px; color: #6c7189; }
.pop .row .sp { flex: 1; }
.pop button { font: inherit; border: 0; background: transparent; color: #6c7189; cursor: pointer; padding: 2px 6px; border-radius: 6px; }
.pop button:hover { background: #eff0f6; color: #17192a; }
.pop button.del:hover { color: #c73b3b; }
.hint { position: fixed; z-index: 2147483002; left: 50%; top: 16px; transform: translateX(-50%); background: #17192a; color: #f6f6fa; font-size: 12px; padding: 8px 14px; border-radius: 999px; box-shadow: 0 8px 24px rgba(0,0,0,.25); display: flex; gap: 12px; align-items: center; }
.hint button { font: inherit; border: 0; background: rgba(255,255,255,.14); color: inherit; border-radius: 999px; padding: 2px 10px; cursor: pointer; }
@media (prefers-color-scheme: dark) {
  .pop { background: #1b1d29; color: #eceef6; border-color: #2a2d3e; }
  .pop textarea { color: #eceef6; }
  .pop .row { border-color: #2a2d3e; }
  .pop button:hover { background: #232637; color: #eceef6; }
}
`;

function send(type, args = {}) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type, args }, (r) => {
            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
            else if (!r || !r.ok) reject(new Error(r?.error || 'No response'));
            else resolve(r.result);
        });
    });
}

export function boot() {
    const host = document.createElement('div');
    host.setAttribute('data-page-notes', '');
    host.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;overflow:visible;z-index:2147483000;';
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = CSS;
    shadow.append(style);
    document.documentElement.append(host);

    let stickies = [];
    let placed = new Map(); // sticky id -> { el, pin }
    let pop = null;
    let picking = null;

    const isOurs = (el) => host.contains(el) || el === host;

    function rectOf(el) {
        const r = el.getBoundingClientRect();
        return { left: r.left + window.scrollX, top: r.top + window.scrollY, width: r.width, height: r.height };
    }

    function layout() {
        for (const { el, pin, ring } of placed.values()) {
            if (!el || !el.isConnected) { pin.style.display = 'none'; if (ring) ring.style.display = 'none'; continue; }
            const r = rectOf(el);
            pin.style.display = '';
            pin.style.left = `${r.left + r.width - 11}px`;
            pin.style.top = `${r.top - 11}px`;
            // the ring is positioned here but shown only on hover or while open
            if (ring) Object.assign(ring.style, { left: `${r.left - 3}px`, top: `${r.top - 3}px`, width: `${r.width + 6}px`, height: `${r.height + 6}px` });
        }
        if (pop?.anchorEl) {
            const r = rectOf(pop.anchorEl);
            pop.style.left = `${Math.max(8, Math.min(r.left, window.scrollX + window.innerWidth - 296))}px`;
            pop.style.top = `${r.top + r.height + 10}px`;
        }
    }

    function closePop() {
        if (pop) { pop.remove(); pop = null; }
        for (const { pin, ring } of placed.values()) { pin.classList.remove('open'); if (ring) ring.style.display = 'none'; }
    }

    function openPop(sticky, el, index) {
        closePop();
        pop = document.createElement('div');
        pop.className = 'pop';
        pop.anchorEl = el;
        const q = document.createElement('div');
        q.className = 'q';
        q.innerHTML = `<b>${index}</b>`;
        q.append(sticky.anchor?.quote?.exact ? `“${sticky.anchor.quote.exact.slice(0, 80)}”` : (sticky.anchor?.label || sticky.anchor?.tag || 'element'));
        const ta = document.createElement('textarea');
        ta.placeholder = 'What about this part? Saves as you type.';
        ta.value = sticky.text || '';
        let timer = null;
        const save = async () => {
            const text = ta.value;
            if (text === sticky.text) return;
            sticky.text = text;
            try { await send('stickyUpdate', { url: location.href, id: sticky.id, text }); status.textContent = 'Saved'; } catch (e) { status.textContent = e.message; }
        };
        ta.addEventListener('input', () => { status.textContent = 'Saving…'; clearTimeout(timer); timer = setTimeout(save, 400); });
        ta.addEventListener('blur', () => { clearTimeout(timer); save(); });
        const row = document.createElement('div');
        row.className = 'row';
        const status = document.createElement('span');
        const sp = document.createElement('span'); sp.className = 'sp';
        const del = document.createElement('button'); del.className = 'del'; del.textContent = 'Delete';
        del.addEventListener('click', async () => { await send('stickyRemove', { url: location.href, id: sticky.id }); await refresh(); });
        const done = document.createElement('button'); done.textContent = 'Done';
        done.addEventListener('click', async () => { clearTimeout(timer); await save(); closePop(); });
        row.append(status, sp, del, done);
        pop.append(q, ta, row);
        shadow.append(pop);
        const entry = placed.get(sticky.id);
        entry?.pin.classList.add('open');
        if (entry?.ring) entry.ring.style.display = '';
        layout();
        ta.focus();
    }

    function render() {
        for (const { pin, ring } of placed.values()) { pin.remove(); ring?.remove(); }
        placed = new Map();
        stickies.forEach((s, i) => {
            const { el, how } = resolve(s.anchor, document);
            const pin = document.createElement('div');
            pin.className = `pin${how === 'orphan' ? ' orphan' : ''}`;
            pin.textContent = String(i + 1);
            pin.title = s.text || 'Sticky';
            let ring = null;
            if (el) {
                ring = document.createElement('div');
                ring.className = 'ring';
                ring.style.display = 'none';
                pin.addEventListener('mouseenter', () => { ring.style.display = ''; layout(); });
                pin.addEventListener('mouseleave', () => { if (!pop || pop.anchorEl !== el) ring.style.display = 'none'; });
                pin.addEventListener('click', (e) => { e.stopPropagation(); openPop(s, el, i + 1); });
                shadow.append(ring);
            } else {
                pin.style.position = 'fixed';
                pin.style.right = `${12 + i * 26}px`;
                pin.style.bottom = '12px';
                pin.title = `${s.text || 'Sticky'} (could not find its place on this page)`;
            }
            shadow.append(pin);
            placed.set(s.id, { el, pin, ring });
        });
        layout();
        send('stickyPlacement', { url: location.href, placement: stickies.map((s) => ({ id: s.id, found: !!placed.get(s.id)?.el })) }).catch(() => {});
    }

    async function refresh() {
        try { stickies = await send('stickies', { url: location.href }); } catch (e) { stickies = []; }
        closePop();
        render();
    }

    // ----- pick mode --------------------
    function enterPick() {
        if (picking) return;
        const ring = document.createElement('div');
        ring.className = 'ring pick';
        ring.style.display = 'none';
        const hint = document.createElement('div');
        hint.className = 'hint';
        hint.append(`Click the part of the page you want to comment on`);
        const cancel = document.createElement('button');
        cancel.textContent = 'Esc to cancel';
        cancel.addEventListener('click', exitPick);
        hint.append(cancel);
        shadow.append(ring, hint);
        let target = null;
        const onMove = (e) => {
            // skip our own hint and ring, which may sit over the page
            const el = (document.elementsFromPoint(e.clientX, e.clientY) || []).find((x) => !isOurs(x));
            if (!el || el === document.documentElement || el === document.body) { ring.style.display = 'none'; target = null; return; }
            target = el;
            const r = rectOf(el);
            ring.style.display = '';
            Object.assign(ring.style, { left: `${r.left - 3}px`, top: `${r.top - 3}px`, width: `${r.width + 6}px`, height: `${r.height + 6}px` });
        };
        const onClick = async (e) => {
            if (!target) return;
            e.preventDefault();
            e.stopPropagation();
            const anchor = describe(target, document);
            exitPick();
            try {
                const s = await send('stickyAdd', { url: location.href, anchor });
                await refresh();
                const placedEntry = placed.get(s.id);
                if (placedEntry?.el) openPop(s, placedEntry.el, stickies.findIndex((x) => x.id === s.id) + 1);
            } catch (err) { console.warn(err); }
        };
        const onKey = (e) => { if (e.key === 'Escape') exitPick(); };
        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('click', onClick, true);
        document.addEventListener('keydown', onKey, true);
        document.documentElement.style.cursor = 'crosshair';
        picking = { ring, hint, onMove, onClick, onKey };
    }
    function exitPick() {
        if (!picking) return;
        document.removeEventListener('mousemove', picking.onMove, true);
        document.removeEventListener('click', picking.onClick, true);
        document.removeEventListener('keydown', picking.onKey, true);
        document.documentElement.style.cursor = '';
        picking.ring.remove();
        picking.hint.remove();
        picking = null;
    }

    function scrollTo(id) {
        const p = placed.get(id);
        if (p?.el) { p.el.scrollIntoView({ block: 'center', behavior: 'smooth' }); const s = stickies.find((x) => x.id === id); setTimeout(() => openPop(s, p.el, stickies.indexOf(s) + 1), 300); }
    }

    chrome.runtime.onMessage.addListener((msg, sender, respond) => {
        if (msg?.type === 'pn:refresh') refresh();
        else if (msg?.type === 'pn:pick') enterPick();
        else if (msg?.type === 'pn:scrollTo') scrollTo(msg.id);
        else if (msg?.type === 'pn:ping') { respond({ ok: true }); return; }
        respond({ ok: true });
    });
    window.addEventListener('scroll', layout, { passive: true });
    window.addEventListener('resize', layout);
    new MutationObserver(() => { clearTimeout(boot._t); boot._t = setTimeout(layout, 100); }).observe(document.body, { childList: true, subtree: true, attributes: false });
    document.addEventListener('click', (e) => { if (pop && !isOurs(e.target)) closePop(); }, true);

    refresh();
    return { refresh, enterPick, scrollTo, app: APP };
}
