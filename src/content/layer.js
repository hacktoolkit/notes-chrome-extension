// The in-page layer: numbered pins on annotated elements, a popover to read
// and edit, and a pick mode to add a sticky to any element. Everything lives
// in a shadow root so page styles and ours never touch.

import { describe, resolve } from '../lib/anchor.js';

const APP = chrome.runtime.getManifest().short_name || chrome.runtime.getManifest().name;

const CSS = `
:host { all: initial; }
[hidden] { display: none !important; }
* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
.pin { position: absolute; z-index: 2147483000; width: 28px; height: 28px; padding: 0; border: 1px solid #bc9138; border-radius: 5px 5px 10px 5px; background: #f9d97e; color: #51390c; font: 700 12px/26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; box-shadow: 0 3px 8px rgba(62,44,9,.25), 0 0 0 2px #fff9e8; cursor: pointer; user-select: none; transition: transform .12s ease; }
.pin::after { content: ''; position: absolute; bottom: 0; right: 0; width: 7px; height: 7px; border-radius: 3px 0 8px 0; background: #c89a3c; }
.pin:hover { transform: scale(1.12); }
.pin.orphan { background: #b7791f; }
.pin.open { background: #ffe9a7; transform: rotate(-4deg) scale(1.1); }
.pin:focus-visible, button:focus-visible { outline: 3px solid #4f5bd5; outline-offset: 3px; }
.ring { position: absolute; z-index: 2147482999; pointer-events: none; border: 2px solid #c4922b; border-radius: 6px; box-shadow: 0 0 0 4px rgba(224,168,74,.15); }
.ring.pick { border-color: #4f5bd5; background: rgba(79,91,213,.07); }
.pop { position: absolute; z-index: 2147483001; width: min(300px, calc(100vw - 16px)); background: #fff9e8; color: #30240f; border-radius: 6px 6px 20px 6px; box-shadow: 0 2px 4px rgba(62,44,9,.08), 0 20px 48px rgba(62,44,9,.22); border: 1px solid #e8cb7e; border-top: 5px solid #f4cd6b; padding: 12px 14px; }
.pop .label { font-size: 10px; letter-spacing: .09em; text-transform: uppercase; font-weight: 700; color: #886622; margin-bottom: 10px; }
.pop .q { font-size: 11px; color: #6c7189; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px; }
.pop .q b { color: #886622; margin-right: 6px; }
.pop textarea { width: 100%; min-height: 64px; resize: none; border: 0; padding: 0; font-size: 13px; line-height: 1.45; color: #17192a; background: transparent; outline: none; }
.pop .row { display: flex; align-items: center; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e3e5ee; font-size: 11px; color: #6c7189; }
.pop .row .sp { flex: 1; }
.pop button { font: inherit; border: 0; background: transparent; color: #6c7189; cursor: pointer; padding: 2px 6px; border-radius: 6px; }
.pop button:hover { background: #eff0f6; color: #17192a; }
.pop button.del:hover { color: #c73b3b; }
.hint { position: fixed; z-index: 2147483002; left: 50%; top: 16px; transform: translateX(-50%); background: #17192a; color: #f6f6fa; font-size: 12px; padding: 8px 14px; border-radius: 999px; box-shadow: 0 8px 24px rgba(0,0,0,.25); display: flex; gap: 12px; align-items: center; }
.hint button { font: inherit; border: 0; background: rgba(255,255,255,.14); color: inherit; border-radius: 999px; padding: 2px 10px; cursor: pointer; }
.dock { position: fixed; bottom: 18px; right: 18px; z-index: 2147483002; display: flex; align-items: center; gap: 10px; background: #fff9e8; color: #51390c; border: 1px solid #e8cb7e; border-radius: 12px; padding: 8px 10px; box-shadow: 0 4px 18px rgba(62,44,9,.18); font-size: 12px; }
.dock .mark { background: #f4cd6b; padding: 3px 6px; border-radius: 3px 3px 7px 3px; font-weight: 700; }
.dock button { border: 0; border-left: 1px solid #e8cb7e; padding: 4px 2px 4px 10px; background: transparent; color: inherit; cursor: pointer; font: inherit; font-weight: 600; }
.dock.with-fab { right: 74px; }
.fab { position: fixed; z-index: 2147483003; width: 44px; height: 44px; padding: 0; border: 1px solid #bc9138; border-radius: 14px 14px 22px 14px; background: #f9d97e; box-shadow: 0 3px 8px rgba(62,44,9,.25), 0 0 0 2px #fff9e8; cursor: grab; display: flex; align-items: center; justify-content: center; touch-action: none; user-select: none; transition: transform .12s ease, box-shadow .12s ease; }
.fab::after { content: ''; position: absolute; bottom: 0; right: 0; width: 11px; height: 11px; border-radius: 4px 0 14px 0; background: #c89a3c; }
.fab img { width: 26px; height: 26px; pointer-events: none; }
.fab .glyph { font-size: 20px; line-height: 1; color: #51390c; pointer-events: none; }
.fab:hover { transform: scale(1.06); }
.fab.dragging { cursor: grabbing; transform: scale(1.08); box-shadow: 0 10px 24px rgba(62,44,9,.3), 0 0 0 2px #fff9e8; }
.fab.open { box-shadow: 0 3px 8px rgba(62,44,9,.25), 0 0 0 3px #4f5bd5; }
.fab .count { position: absolute; top: -7px; left: -7px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 9px; background: #c73b3b; color: #fff; font: 700 11px/18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; }
.widget { position: fixed; z-index: 2147483004; width: min(384px, calc(100vw - 16px)); height: min(620px, calc(100vh - 24px)); display: flex; flex-direction: column; overflow: hidden; background: #f6f6fa; color: #17192a; border: 1px solid #d3d6e3; border-radius: 14px; box-shadow: 0 2px 4px rgba(23,25,42,.06), 0 24px 56px rgba(23,25,42,.28); }
.widget .bar { display: flex; align-items: center; gap: 8px; height: 32px; padding: 0 6px 0 12px; background: #eff0f6; border-bottom: 1px solid #e3e5ee; color: #6c7189; font: 600 11px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; letter-spacing: .04em; text-transform: uppercase; cursor: grab; user-select: none; touch-action: none; }
.widget .bar .grip { color: #b7bbcf; letter-spacing: -2px; font-size: 14px; }
.widget .bar .sp { flex: 1; }
.widget .bar button { font: inherit; font-size: 14px; line-height: 1; border: 0; background: transparent; color: #6c7189; cursor: pointer; padding: 4px 7px; border-radius: 6px; }
.widget .bar button:hover { background: #e3e5ee; color: #17192a; }
.widget.dragging .bar { cursor: grabbing; }
.widget iframe { flex: 1; width: 100%; border: 0; background: transparent; color-scheme: light dark; }
@media (prefers-color-scheme: dark) {
  .widget { background: #13141c; color: #eceef6; border-color: #383c52; }
  .widget .bar { background: #1b1d29; border-color: #2a2d3e; color: #9397ae; }
  .widget .bar .grip { color: #4a4e66; }
  .widget .bar button { color: #9397ae; }
  .widget .bar button:hover { background: #2c3043; color: #eceef6; }
  .pop, .dock { background: #302a1e; color: #f4e7c7; border-color: #6d5830; }
  .pop textarea { color: #f4e7c7; }
  .pop .q, .pop .row, .pop button { color: #c4b58f; }
  .pop .label, .pop .q b { color: #f1ce7d; }
  .pop .row { border-color: #6d5830; }
  .pop button:hover { background: #443923; color: #f4e7c7; }
  .dock .mark { color: #51390c; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
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
    // a host left by an earlier extension instance is dead: start clean
    for (const stale of document.querySelectorAll('[data-page-notes]')) stale.remove();
    const host = document.createElement('div');
    host.setAttribute('data-page-notes', '');
    host.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;overflow:visible;z-index:2147483000;';
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = CSS;
    shadow.append(style);
    const annotations = document.createElement('div');
    annotations.className = 'annotations';
    annotations.hidden = true;
    const dock = document.createElement('div'); dock.className = 'dock'; dock.hidden = true;
    const mark = document.createElement('span'); mark.className = 'mark';
    const dockLabel = document.createElement('span'); dockLabel.textContent = APP;
    const toggle = document.createElement('button');
    dock.append(mark, dockLabel, toggle);
    // the floating button and the window it opens (launch mode "floating")
    const fab = document.createElement('button');
    fab.className = 'fab'; fab.hidden = true; fab.title = `${APP}: notes for this page (drag to move)`;
    fab.setAttribute('aria-label', `${APP}: open notes for this page`);
    const fabIcon = document.createElement('img'); fabIcon.alt = ''; fabIcon.src = chrome.runtime.getURL('img/icon32.png');
    fabIcon.addEventListener('error', () => { fabIcon.replaceWith(Object.assign(document.createElement('span'), { className: 'glyph', textContent: '✎' })); });
    const fabCount = document.createElement('span'); fabCount.className = 'count'; fabCount.hidden = true;
    fab.append(fabIcon, fabCount);
    shadow.append(annotations, dock, fab);
    document.documentElement.append(host);

    let stickies = [];
    let placed = new Map(); // sticky id -> { el, pin }
    let pop = null;
    let picking = null;
    let visible = true;
    let visibilityVersion = 0;

    function setVisible(value) {
        visible = value;
        if (!visible) { exitPick(); closePop(); }
        annotations.hidden = !visible;
        dock.hidden = stickies.length === 0;
        mark.textContent = String(stickies.length);
        updateFabCount(stickies.length);
        toggle.textContent = visible ? 'Hide stickies' : 'Show stickies';
        toggle.setAttribute('aria-pressed', String(visible));
        layout();
    }
    async function reveal() {
        const result = await send('stickyVisibility', { visible: true });
        setVisible(result.visible);
    }
    toggle.addEventListener('click', async () => {
        try { const result = await send('stickyVisibility', { visible: !visible }); setVisible(result.visible); }
        catch (e) { toggle.textContent = 'Try again'; toggle.title = e.message; }
    });

    const isOurs = (el) => host.contains(el) || el === host;

    function rectOf(el) {
        const r = el.getBoundingClientRect();
        return { left: r.left + window.scrollX, top: r.top + window.scrollY, width: r.width, height: r.height };
    }

    function layout() {
        for (const { el, pin, ring } of placed.values()) {
            if (!el) continue; // Orphans live in a fixed tray above the control.
            if (!el.isConnected) { pin.style.display = 'none'; if (ring) ring.style.display = 'none'; continue; }
            const r = rectOf(el);
            pin.style.display = '';
            pin.style.left = `${Math.max(window.scrollX, Math.min(r.left + r.width - 14, window.scrollX + window.innerWidth - 30))}px`;
            pin.style.top = `${Math.max(0, r.top - 14)}px`;
            // the ring is positioned here but shown only on hover or while open
            if (ring) Object.assign(ring.style, { left: `${r.left - 3}px`, top: `${r.top - 3}px`, width: `${r.width + 6}px`, height: `${r.height + 6}px` });
        }
        if (pop?.anchorEl) {
            const r = rectOf(pop.anchorEl);
            pop.style.left = `${Math.max(window.scrollX + 8, Math.min(r.left, window.scrollX + window.innerWidth - 316))}px`;
            pop.style.top = `${r.top + r.height + 10}px`;
        }
    }

    function closePop() {
        if (pop) { pop.flush?.(); pop.remove(); pop = null; }
        for (const { pin, ring } of placed.values()) { pin.classList.remove('open'); if (ring) ring.style.display = 'none'; }
    }

    function openPop(sticky, el, index) {
        closePop();
        pop = document.createElement('div');
        pop.className = 'pop';
        pop.anchorEl = el;
        const label = document.createElement('div'); label.className = 'label'; label.textContent = `${APP} · Sticky ${index}`;
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
            try { await send('stickyUpdate', { url: location.href, id: sticky.id, text }); sticky.text = text; status.textContent = 'Saved'; } catch (e) { status.textContent = e.message; }
        };
        ta.addEventListener('input', () => { status.textContent = 'Saving…'; clearTimeout(timer); timer = setTimeout(save, 400); });
        ta.addEventListener('blur', () => { clearTimeout(timer); save(); });
        const row = document.createElement('div');
        row.className = 'row';
        const status = document.createElement('span');
        const sp = document.createElement('span'); sp.className = 'sp';
        const del = document.createElement('button'); del.className = 'del'; del.textContent = 'Delete';
        del.addEventListener('click', async () => { clearTimeout(timer); if (pop) pop.flush = null; await send('stickyRemove', { url: location.href, id: sticky.id }); await refresh(); });
        const done = document.createElement('button'); done.textContent = 'Done';
        done.addEventListener('click', async () => { clearTimeout(timer); await save(); closePop(); });
        row.append(status, sp, del, done);
        pop.flush = () => { clearTimeout(timer); return save(); };
        pop.append(label, q, ta, row);
        annotations.append(pop);
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
            const pin = document.createElement('button');
            pin.className = `pin${how === 'orphan' ? ' orphan' : ''}`;
            pin.textContent = String(i + 1);
            pin.title = s.text || 'Sticky';
            pin.setAttribute('aria-label', `Sticky ${i + 1}: ${s.text || 'No comment yet'}`);
            let ring = null;
            if (el) {
                ring = document.createElement('div');
                ring.className = 'ring';
                ring.style.display = 'none';
                pin.addEventListener('mouseenter', () => { ring.style.display = ''; layout(); });
                pin.addEventListener('mouseleave', () => { if (!pop || pop.anchorEl !== el) ring.style.display = 'none'; });
                pin.addEventListener('click', (e) => { e.stopPropagation(); openPop(s, el, i + 1); });
                annotations.append(ring);
            } else {
                pin.style.position = 'fixed';
                pin.style.right = `${12 + i * 34}px`;
                pin.style.bottom = '74px';
                pin.title = `${s.text || 'Sticky'} (could not find its place on this page)`;
                pin.addEventListener('click', () => { openPop(s, null, i + 1); pop.style.position = 'fixed'; pop.style.right = '16px'; pop.style.bottom = '112px'; });
            }
            annotations.append(pin);
            placed.set(s.id, { el, pin, ring });
        });
        setVisible(visible);
        send('stickyPlacement', { url: location.href, placement: stickies.map((s) => ({ id: s.id, found: !!placed.get(s.id)?.el })) }).catch(() => {});
    }

    async function refresh() {
        if (pop?.flush) await pop.flush();
        try { stickies = await send('stickies', { url: location.href }); } catch (e) { stickies = []; }
        closePop();
        render();
    }

    // ----- floating widget --------------------
    // The note itself is the extension's own panel page in an iframe, so the
    // page we sit on can neither read nor style it. The layer only places the
    // frame and the button, and remembers where the user dragged them.
    let widget = null, frame = null;
    let layoutState = {}; // { fab: {x, y}, widget: {x, y} } in viewport px
    const extensionOrigin = new URL(chrome.runtime.getURL('')).origin;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    function placeFab() {
        const w = fab.offsetWidth || 44, h = fab.offsetHeight || 44;
        const pos = layoutState.fab || { x: window.innerWidth - w - 18, y: window.innerHeight - h - 18 };
        const x = clamp(pos.x, 4, window.innerWidth - w - 4), y = clamp(pos.y, 4, window.innerHeight - h - 4);
        fab.style.left = `${x}px`; fab.style.top = `${y}px`;
    }
    function placeWidget() {
        if (!widget || widget.hidden) return;
        const w = widget.offsetWidth || 384, h = widget.offsetHeight || 620;
        let pos = layoutState.widget;
        if (!pos) {
            // next to the button: above it when it sits low, below when high,
            // right-aligned on the right half of the viewport
            const f = fab.getBoundingClientRect();
            const x = f.left + f.width / 2 > window.innerWidth / 2 ? f.right - w : f.left;
            const y = f.top + f.height / 2 > window.innerHeight / 2 ? f.top - h - 10 : f.bottom + 10;
            pos = { x, y };
        }
        widget.style.left = `${clamp(pos.x, 4, Math.max(4, window.innerWidth - w - 4))}px`;
        widget.style.top = `${clamp(pos.y, 4, Math.max(4, window.innerHeight - h - 4))}px`;
    }
    function saveLayout(patch) {
        layoutState = { ...layoutState, ...patch };
        send('widgetLayout', { layout: patch }).catch(() => {});
    }
    // Drag by pointer; a press that barely moves is a click.
    function draggable(el, handle, key, onClick) {
        let start = null;
        handle.addEventListener('pointerdown', (e) => {
            if (e.button !== 0) return;
            const r = el.getBoundingClientRect();
            start = { x: e.clientX, y: e.clientY, left: r.left, top: r.top, moved: false };
            try { handle.setPointerCapture(e.pointerId); } catch (err) { /* synthetic pointer */ }
        });
        handle.addEventListener('pointermove', (e) => {
            if (!start) return;
            const dx = e.clientX - start.x, dy = e.clientY - start.y;
            if (!start.moved && Math.hypot(dx, dy) < 4) return;
            start.moved = true;
            el.classList.add('dragging');
            const w = el.offsetWidth, h = el.offsetHeight;
            el.style.left = `${clamp(start.left + dx, 4, window.innerWidth - w - 4)}px`;
            el.style.top = `${clamp(start.top + dy, 4, window.innerHeight - h - 4)}px`;
            if (el === fab && !layoutState.widget) placeWidget();
        });
        const finish = (e) => {
            if (!start) return;
            const moved = start.moved;
            start = null;
            el.classList.remove('dragging');
            try { handle.releasePointerCapture(e.pointerId); } catch (err) { /* already released */ }
            if (moved) saveLayout({ [key]: { x: parseFloat(el.style.left), y: parseFloat(el.style.top) } });
            else if (onClick) onClick();
        };
        handle.addEventListener('pointerup', finish);
        handle.addEventListener('pointercancel', finish);
    }
    function showFab() {
        if (!fab.hidden) return;
        fab.hidden = false;
        dock.classList.add('with-fab');
        placeFab();
    }
    function updateFabCount(n) {
        fabCount.hidden = !n;
        fabCount.textContent = String(n);
    }
    function openWidget() {
        if (!widget) {
            widget = document.createElement('div');
            widget.className = 'widget';
            widget.setAttribute('role', 'dialog');
            widget.setAttribute('aria-label', `${APP} for this page`);
            const bar = document.createElement('div'); bar.className = 'bar';
            const grip = document.createElement('span'); grip.className = 'grip'; grip.textContent = '⋮⋮'; grip.setAttribute('aria-hidden', 'true');
            const title = document.createElement('span'); title.textContent = APP;
            const sp = document.createElement('span'); sp.className = 'sp';
            const close = document.createElement('button'); close.textContent = '✕'; close.title = 'Close (Esc)'; close.setAttribute('aria-label', 'Close notes');
            close.addEventListener('click', closeWidget);
            bar.append(grip, title, sp, close);
            frame = document.createElement('iframe');
            frame.src = `${chrome.runtime.getURL('src/panel.html')}?embed=1`;
            frame.title = `${APP} for this page`;
            frame.allow = 'clipboard-write';
            widget.append(bar, frame);
            shadow.append(widget);
            draggable(widget, bar, 'widget');
        } else {
            widget.hidden = false;
            frame.contentWindow?.postMessage({ type: 'pn:shown' }, extensionOrigin);
        }
        fab.classList.add('open');
        placeWidget();
        frame.focus();
    }
    function closeWidget() {
        if (!widget || widget.hidden) return;
        widget.hidden = true;
        fab.classList.remove('open');
        fab.focus();
    }
    function toggleWidget() { if (widget && !widget.hidden) closeWidget(); else openWidget(); }
    draggable(fab, fab, 'fab', toggleWidget);
    window.addEventListener('message', (e) => {
        if (!frame || e.source !== frame.contentWindow || e.origin !== extensionOrigin) return;
        if (e.data?.type === 'pn:widget-close') closeWidget();
    });
    window.addEventListener('resize', () => { if (!fab.hidden) placeFab(); placeWidget(); });

    // ----- pick mode --------------------
    async function enterPick() {
        await reveal();
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
            if (isOurs(e.target)) return;
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

    async function scrollTo(id) {
        await reveal();
        const p = placed.get(id);
        if (p?.el) { p.el.scrollIntoView({ block: 'center', behavior: 'smooth' }); const s = stickies.find((x) => x.id === id); setTimeout(() => openPop(s, p.el, stickies.indexOf(s) + 1), 300); }
    }

    chrome.runtime.onMessage.addListener((msg, sender, respond) => {
        if (msg?.type === 'pn:refresh') refresh();
        else if (msg?.type === 'pn:pick') enterPick();
        else if (msg?.type === 'pn:scrollTo') scrollTo(msg.id);
        else if (msg?.type === 'pn:visibility') { ++visibilityVersion; setVisible(msg.visible); }
        else if (msg?.type === 'pn:widget') {
            // the toolbar click in floating mode: show the button, open or toggle the window
            const ready = Object.keys(layoutState).length ? Promise.resolve() : send('widgetLayout').then((l) => { layoutState = l && typeof l === 'object' ? l : {}; }, () => {});
            ready.then(() => { showFab(); if (msg.toggle) toggleWidget(); else openWidget(); });
        }
        else if (msg?.type === 'pn:ping') { respond({ ok: true }); return; }
        respond({ ok: true });
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && widget && !widget.hidden && !picking) closeWidget(); }, true);
    window.addEventListener('scroll', layout, { passive: true });
    window.addEventListener('resize', layout);
    new MutationObserver(() => { clearTimeout(boot._t); boot._t = setTimeout(layout, 100); }).observe(document.body, { childList: true, subtree: true, attributes: false });
    document.addEventListener('click', (e) => { if (pop && !isOurs(e.target)) closePop(); }, true);

    const version = visibilityVersion;
    send('stickyVisibility').then((r) => { if (version === visibilityVersion) setVisible(r.visible); }).then(refresh).catch(() => {});
    // false once the extension that created us was reloaded or updated
    const alive = () => { try { return !!chrome.runtime?.id; } catch (e) { return false; } };
    return { refresh, enterPick, scrollTo, openWidget, closeWidget, alive, app: APP };
}
