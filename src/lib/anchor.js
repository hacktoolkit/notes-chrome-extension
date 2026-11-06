// Anchors: how a sticky finds its element again. Pure over a minimal DOM
// surface (tagName, id, parentElement, children, textContent, getAttribute,
// querySelector/querySelectorAll on the root) so it runs in the page and in
// node tests with fake nodes.
//
// An anchor keeps three locators and resolves in order:
//   1. css   a selector rooted at the nearest ancestor with a stable id,
//            verified by text similarity;
//   2. quote the element's text with a little before and after (W3C
//            TextQuoteSelector), found by searching the document;
//   3. path  a structural tag:nth-of-type chain from the root, last resort.
// Anything that fails verification is reported as orphaned, never guessed.

const QUOTE_MAX = 200;
const CONTEXT = 32;
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'SVG', 'PATH']);

export function normalizeText(s) {
    return (s || '').replace(/\s+/g, ' ').trim();
}

// ids that look generated (hashes, numbers, framework suffixes) are not stable
export function isStableId(id) {
    if (!id || id.length > 64) return false;
    if (!/^[A-Za-z_][\w:.-]*$/.test(id)) return false;
    if (/\d{5,}/.test(id)) return false;
    if (/^(?:[a-f0-9]{8,}|[A-Za-z0-9]{20,})$/.test(id)) return false;
    if (/^(?:ember|react|mui|radix|headlessui|rc_|__|:r)/.test(id)) return false;
    return true;
}

function cssEscape(s) {
    return s.replace(/([^\w-])/g, '\\$1');
}

function nthOfType(el) {
    const parent = el.parentElement;
    if (!parent) return 1;
    let n = 0;
    for (const sib of parent.children) {
        if (sib.tagName === el.tagName) n++;
        if (sib === el) return n;
    }
    return n || 1;
}

function stepFor(el) {
    return `${el.tagName.toLowerCase()}:nth-of-type(${nthOfType(el)})`;
}

// Selector from the nearest stable-id ancestor (or the root) down to el.
export function cssPathFor(el) {
    const steps = [];
    let node = el;
    while (node && node.tagName && node.tagName !== 'HTML') {
        if (node.id && isStableId(node.id)) {
            steps.unshift(`#${cssEscape(node.id)}`);
            return steps.join(' > ');
        }
        steps.unshift(node.tagName === 'BODY' ? 'body' : stepFor(node));
        node = node.parentElement;
    }
    return steps.join(' > ');
}

export function structuralPathFor(el) {
    const steps = [];
    let node = el;
    while (node && node.tagName && node.tagName !== 'HTML') {
        steps.unshift(node.tagName === 'BODY' ? 'body' : stepFor(node));
        node = node.parentElement;
    }
    return steps.join(' > ');
}

// Text before and after the element in document order, for the quote.
function contextAround(el, root) {
    const all = normalizeText(root.textContent || '');
    const own = normalizeText(el.textContent || '');
    if (!own) return { prefix: '', suffix: '' };
    // the element's text may appear more than once; use the occurrence that
    // matches its position among equal texts
    let occurrence = 0;
    for (const other of root.querySelectorAll ? root.querySelectorAll(el.tagName) : []) {
        if (other === el) break;
        if (normalizeText(other.textContent || '') === own) occurrence++;
    }
    let idx = -1;
    for (let i = 0; i <= occurrence; i++) idx = all.indexOf(own, idx + 1);
    if (idx < 0) return { prefix: '', suffix: '' };
    return { prefix: all.slice(Math.max(0, idx - CONTEXT), idx), suffix: all.slice(idx + own.length, idx + own.length + CONTEXT) };
}

export function describe(el, root) {
    const text = normalizeText(el.textContent || '');
    const exact = text.slice(0, QUOTE_MAX);
    const { prefix, suffix } = contextAround(el, root);
    return {
        css: cssPathFor(el),
        path: structuralPathFor(el),
        quote: { exact, prefix, suffix },
        tag: el.tagName.toLowerCase(),
        label: normalizeText(el.getAttribute?.('aria-label') || el.getAttribute?.('alt') || el.getAttribute?.('title') || '').slice(0, 80)
    };
}

// Dice coefficient on word bigrams; 1 is identical.
export function similarity(a, b) {
    const w = (s) => normalizeText(s).toLowerCase().split(' ').filter(Boolean);
    const A = w(a), B = w(b);
    if (A.length === 0 && B.length === 0) return 1;
    if (A.length < 2 || B.length < 2) return A.join(' ') === B.join(' ') ? 1 : 0;
    const grams = (x) => { const m = new Map(); for (let i = 0; i < x.length - 1; i++) { const g = `${x[i]} ${x[i + 1]}`; m.set(g, (m.get(g) || 0) + 1); } return m; };
    const ga = grams(A), gb = grams(B);
    let hit = 0;
    for (const [g, n] of ga) hit += Math.min(n, gb.get(g) || 0);
    return (2 * hit) / ((A.length - 1) + (B.length - 1));
}

function textOf(el) {
    return normalizeText(el.textContent || '').slice(0, QUOTE_MAX);
}

function verify(el, anchor) {
    if (!el) return 0;
    if (!anchor.quote?.exact) return 0.5;
    return similarity(textOf(el), anchor.quote.exact);
}

// Smallest element whose text contains the quote, preferring the same tag and
// the right context.
function findByQuote(anchor, root) {
    const exact = anchor.quote?.exact;
    if (!exact || !root.querySelectorAll) return null;
    const all = normalizeText(root.textContent || '');
    if (!all.includes(exact)) return null;
    let best = null;
    let bestScore = -1;
    for (const el of root.querySelectorAll('*')) {
        if (SKIP_TAGS.has(el.tagName)) continue;
        const t = normalizeText(el.textContent || '');
        if (!t.includes(exact)) continue;
        // prefer tight matches: short text that still contains the quote
        let score = exact.length / Math.max(t.length, 1);
        if (el.tagName.toLowerCase() === anchor.tag) score += 0.05;
        if (score > bestScore) { best = el; bestScore = score; }
    }
    return best;
}

export function resolve(anchor, root) {
    if (!anchor) return { el: null, how: 'orphan', confidence: 0 };
    const tryCss = (sel) => { try { return sel ? root.querySelector(sel) : null; } catch (e) { return null; } };
    let el = tryCss(anchor.css);
    let conf = verify(el, anchor);
    if (el && conf >= 0.6) return { el, how: 'css', confidence: conf };
    const byQuote = findByQuote(anchor, root);
    if (byQuote) return { el: byQuote, how: 'quote', confidence: Math.max(0.6, similarity(textOf(byQuote), anchor.quote.exact)) };
    el = tryCss(anchor.path);
    conf = verify(el, anchor);
    if (el && conf >= 0.6) return { el, how: 'path', confidence: conf };
    if (el && !anchor.quote?.exact) return { el, how: 'path', confidence: 0.5 };
    return { el: null, how: 'orphan', confidence: 0 };
}
