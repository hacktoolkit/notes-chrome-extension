import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cssPathFor, describe, isStableId, resolve, similarity, structuralPathFor } from '../src/lib/anchor.js';

// A tiny DOM: enough of the surface anchor.js uses.
function node(tag, attrs = {}, children = []) {
    const el = { tagName: tag.toUpperCase(), id: attrs.id || '', attrs, children: [], parentElement: null, text: attrs.text || '' };
    for (const c of children) { c.parentElement = el; el.children.push(c); }
    Object.defineProperty(el, 'textContent', { get() { return el.text + el.children.map((c) => c.textContent).join(' '); } });
    el.getAttribute = (k) => attrs[k] || null;
    return el;
}
function all(el, out = []) { out.push(el); el.children.forEach((c) => all(c, out)); return out; }
function matchesStep(el, step) {
    if (step.startsWith('#')) return el.id === step.slice(1).replace(/\\(.)/g, '$1');
    if (step === 'body') return el.tagName === 'BODY';
    const m = /^(\w+):nth-of-type\((\d+)\)$/.exec(step);
    if (!m) return false;
    if (el.tagName.toLowerCase() !== m[1]) return false;
    const sibs = el.parentElement ? el.parentElement.children.filter((s) => s.tagName === el.tagName) : [el];
    return sibs.indexOf(el) + 1 === Number(m[2]);
}
function root(html) {
    const r = node('html', {}, [html]);
    r.querySelectorAll = (sel) => sel === '*' ? all(r).slice(1) : all(r).filter((e) => e.tagName.toLowerCase() === sel.toLowerCase());
    r.querySelector = (sel) => {
        const steps = sel.split(' > ');
        const candidates = all(r).filter((e) => {
            let n = e;
            for (let i = steps.length - 1; i >= 0; i--) {
                if (!n || !matchesStep(n, steps[i])) return false;
                n = n.parentElement;
            }
            return true;
        });
        return candidates[0] || null;
    };
    return r;
}

const page = () => {
    const li2 = node('li', { text: 'Second point about pricing' });
    const ul = node('ul', {}, [node('li', { text: 'First point about speed' }), li2, node('li', { text: 'Third point about support' })]);
    const h = node('h2', { text: 'Pricing' });
    const p = node('p', { text: 'Plans start at $9 per month, billed yearly.' });
    const section = node('section', { id: 'pricing' }, [h, p, ul]);
    const intro = node('p', { text: 'Welcome to the product.' });
    const body = node('body', {}, [node('div', { id: '__next' }, [node('main', {}, [intro, section])])]);
    return { root: root(body), li2, p, h, intro };
};

test('isStableId rejects generated ids', () => {
    assert.ok(isStableId('pricing'));
    assert.ok(isStableId('main-nav'));
    assert.ok(!isStableId('__next'));
    assert.ok(!isStableId('react-select-2-input'.replace('react-select', 'react')));
    assert.ok(!isStableId('a1b2c3d4e5f6a7b8'));
    assert.ok(!isStableId('item-1234567'));
    assert.ok(!isStableId(':r1:'));
});

test('cssPathFor roots at the nearest stable id; structural path reaches body', () => {
    const { li2, p } = page();
    assert.equal(cssPathFor(li2), '#pricing > ul:nth-of-type(1) > li:nth-of-type(2)');
    assert.equal(cssPathFor(p), '#pricing > p:nth-of-type(1)');
    assert.equal(structuralPathFor(p), 'body > div:nth-of-type(1) > main:nth-of-type(1) > section:nth-of-type(1) > p:nth-of-type(1)');
});

test('describe captures a quote with context', () => {
    const { root: r, li2 } = page();
    const a = describe(li2, r);
    assert.equal(a.quote.exact, 'Second point about pricing');
    assert.match(a.quote.prefix, /First point about speed ?$/);
    assert.match(a.quote.suffix, /^ Third point/);
    assert.equal(a.tag, 'li');
});

test('resolve: css first, then quote when the structure moved, orphan when the text is gone', () => {
    const { root: r, li2 } = page();
    const a = describe(li2, r);
    assert.equal(resolve(a, r).how, 'css');
    assert.equal(resolve(a, r).el, li2);
    // the list gained an item at the front: css points at the wrong li, text search recovers it
    const moved = page();
    moved.li2.parentElement.children.unshift(node('li', { text: 'A brand new first point' }));
    moved.li2.parentElement.children[0].parentElement = moved.li2.parentElement;
    const r2 = resolve(a, moved.root);
    assert.equal(r2.how, 'quote');
    assert.equal(r2.el.textContent, 'Second point about pricing');
    // the text changed completely: orphan, not a guess
    const gone = page();
    gone.li2.text = 'Something else entirely now';
    const r3 = resolve(a, gone.root);
    assert.equal(r3.how, 'orphan');
    assert.equal(r3.el, null);
});

test('resolve verifies by similarity, so a slightly edited element still matches', () => {
    const { root: r, p } = page();
    const a = describe(p, r);
    p.text = 'Plans start at $12 per month, billed yearly.';
    const res = resolve(a, r);
    assert.equal(res.how, 'css');
    assert.ok(res.confidence >= 0.6, String(res.confidence));
    assert.ok(similarity('a b c d', 'a b c d') === 1);
    assert.ok(similarity('a b c d', 'x y z') === 0);
});
