// End-to-end smoke test. Launches a headless Chromium-based browser with the
// extension loaded, drives it over the DevTools protocol, and asserts on real
// browser state. Network is blocked so seeded URLs stay exactly as given.
//
//   make e2e
//   BROWSER=/path/to/chromium make e2e
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join as pjoin, extname } from 'node:path';
import { createServer } from 'node:http';

// A local page for the in-page layer, plus the extension's src served over
// http so the layer module can be imported into the page with a stubbed
// chrome.* (the real injection needs a click the harness cannot give).
const FIXTURE_HTML = `<!doctype html><html><head><title>Pricing – Site</title></head><body>
<div id="__next"><main>
<p>Welcome to the product.</p>
<section id="pricing"><h2>Pricing</h2><p>Plans start at $9 per month, billed yearly.</p>
<ul><li>First point about speed</li><li>Second point about pricing</li><li>Third point about support</li></ul></section>
</main></div></body></html>`;
const server = createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1');
    if (url.pathname === '/pricing') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(FIXTURE_HTML); }
    if (url.pathname.startsWith('/src/')) {
        try {
            const body = readFileSync(pjoin(EXT, url.pathname), 'utf8');
            res.writeHead(200, { 'content-type': extname(url.pathname) === '.js' ? 'text/javascript' : 'text/plain' });
            return res.end(body);
        } catch (e) { /* fall through */ }
    }
    res.writeHead(404); res.end('nope');
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const LOCAL = `http://127.0.0.1:${server.address().port}`;
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXT = process.env.EXT || resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NAME = JSON.parse(readFileSync(join(EXT, 'manifest.json'), 'utf8')).name;
const CANDIDATES = [process.env.BROWSER, '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/brave-browser'].filter(Boolean);
const CHROME = CANDIDATES.find((c) => existsSync(c));
if (!CHROME) { console.error('No Chromium-based browser found. Set BROWSER=/path/to/binary'); process.exit(2); }
const PORT = Number(process.env.PORT) || 9337;
const HOLODECK = process.env.HOLODECK || join(homedir(), '.holodeck');
mkdirSync(join(HOLODECK, 'tmp'), { recursive: true });
const profile = mkdtempSync(join(HOLODECK, 'tmp', 'e2e-'));

const chrome = spawn(CHROME, [
    `--user-data-dir=${profile}`, `--load-extension=${EXT}`, `--remote-debugging-port=${PORT}`,
    '--headless=new', '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', '--no-first-run', '--no-default-browser-check',
    ...(process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] : []),
    'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });
let stderr = '';
chrome.stderr.on('data', (d) => { stderr += d; });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const targets = async () => (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
async function waitFor(pred, label, tries = 60) {
    for (let i = 0; i < tries; i++) {
        try { const t = (await targets()).find(pred); if (t) return t; } catch (e) { /* not up yet */ }
        await sleep(250);
    }
    throw new Error(`timeout waiting for ${label}`);
}
class CDP {
    constructor(ws) {
        this.ws = ws; this.id = 0; this.pending = new Map();
        ws.addEventListener('message', (m) => {
            const msg = JSON.parse(m.data);
            if (msg.id && this.pending.has(msg.id)) { const { res, rej } = this.pending.get(msg.id); this.pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
        });
    }
    static async connect(url) { const ws = new WebSocket(url); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; }); return new CDP(ws); }
    send(method, params = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, method, params })); return new Promise((res, rej) => this.pending.set(id, { res, rej })); }
    async eval(expression) {
        const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || JSON.stringify(r.exceptionDetails));
        return r.result.value;
    }
}
// Browsers ship built-in extensions with service workers of their own, so find
// ours by manifest name rather than by URL shape.
async function findExtensionId() {
    for (let i = 0; i < 60; i++) {
        let list = [];
        try { list = await targets(); } catch (e) { /* not up yet */ }
        for (const t of list.filter((t) => t.type === 'service_worker' && t.url.endsWith('/src/background.js'))) {
            try {
                const cdp = await CDP.connect(t.webSocketDebuggerUrl);
                const name = await cdp.eval('chrome.runtime.getManifest().name');
                cdp.ws.close();
                if (name === NAME) return new URL(t.url).host;
            } catch (e) { /* try the next one */ }
        }
        await sleep(250);
    }
    throw new Error(`timeout waiting for the ${NAME} service worker\n${stderr.split('\n').slice(-5).join('\n')}`);
}

let failures = 0;
function check(label, cond, detail = '') {
    console.log(`${cond ? 'PASS' : 'FAIL'} ${label}${detail ? `  ${detail}` : ''}`);
    if (!cond) failures++;
}

async function screenshot(cdp, name, width, height, dark = false) {
    if (!process.env.E2E_SCREENSHOTS) return;
    mkdirSync(process.env.E2E_SCREENSHOTS, { recursive: true });
    await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }] });
    await sleep(200);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(process.env.E2E_SCREENSHOTS, `${name}.png`), Buffer.from(shot.data, 'base64'));
}

try {
    const extId = await findExtensionId();
    const browserInfo = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    const browser = await CDP.connect(browserInfo.webSocketDebuggerUrl);

    // the popup opened as a tab can drive chrome.runtime.sendMessage
    await browser.send('Target.createTarget', { url: `chrome-extension://${extId}/src/popup.html`, newWindow: true });
    const popupT = await waitFor((t) => t.url.endsWith('/src/popup.html'), 'popup');
    const popup = await CDP.connect(popupT.webSocketDebuggerUrl);
    for (let i = 0; i < 40; i++) {
        if (await popup.eval(`typeof chrome !== 'undefined' && !!chrome.windows && location.protocol === 'chrome-extension:'`).catch(() => false)) break;
        await sleep(250);
    }
    const toMarkdownOf = (id) => popup.eval(`import('./lib/notes.js').then(async (m) => m.toMarkdown(await new Promise((res) => chrome.runtime.sendMessage({ type: 'get', args: { id: ${JSON.stringify(id)} } }, (r) => res(r.result)))))`);
    const send = (msg) => popup.eval(`new Promise((res, rej) => chrome.runtime.sendMessage(${JSON.stringify(msg)}, (r) => r && r.ok ? res(r.result) : rej(new Error(r ? r.error : chrome.runtime.lastError?.message))))`);
    const tabs = () => popup.eval('chrome.tabs.query({})');

    await popup.eval(`chrome.windows.create({ url: ['https://github.com/dataro/app/pull/482', 'https://github.com/dataro/app/pull/482/files', 'https://example.com/plain'], focused: false })`);
    await sleep(1200);
    const tabByUrl = async (u) => (await tabs()).find((t) => t.url === u);
    const pr = await tabByUrl('https://github.com/dataro/app/pull/482');
    const prFiles = await tabByUrl('https://github.com/dataro/app/pull/482/files');
    const plain = await tabByUrl('https://example.com/plain');

    // current page with no note yet
    let cur = await send({ type: 'current', args: { tabId: pr.id } });
    check('current resolves the page and its rule', cur.tab?.id === pr.id && cur.ident?.rule === 'GitHub pull request' && cur.note === null, JSON.stringify(cur.ident));

    // add two entries from two URL variants of the same page
    const n1 = await send({ type: 'addEntry', args: { tabId: pr.id, text: 'Reviewed, waiting on CI.' } });
    const n2 = await send({ type: 'addEntry', args: { tabId: prFiles.id, text: 'CI green, two nits.' } });
    check('note follows the page across URL variants', n1.id === n2.id && n2.entries.length === 2, `${n1.id} vs ${n2.id}, ${n2.entries.length} entries`);
    check('entries are dated', /^\d{4}-\d{2}-\d{2}T/.test(n2.entries[0].at));

    // badge shows the entry count on both variant tabs
    await sleep(600);
    const badgeA = await popup.eval(`chrome.action.getBadgeText({ tabId: ${pr.id} })`);
    const badgeB = await popup.eval(`chrome.action.getBadgeText({ tabId: ${prFiles.id} })`);
    const badgeC = await popup.eval(`chrome.action.getBadgeText({ tabId: ${plain.id} })`);
    check('presence badge on both variants, none on an unrelated page', badgeA === '2' && badgeB === '2' && badgeC === '', `${badgeA}/${badgeB}/${badgeC}`);
    check('saved-note badge is red and explains its count', (await popup.eval(`chrome.action.getBadgeBackgroundColor({ tabId: ${pr.id} })`)).slice(0, 3).join(',') === '199,59,59' && /2 saved notes/.test(await popup.eval(`chrome.action.getTitle({ tabId: ${pr.id} })`)));

    // edit and remove
    const edited = await send({ type: 'updateEntry', args: { id: n2.id, index: 0, text: 'Reviewed. Waiting on CI.' } });
    check('entry edit', edited.entries[0].text === 'Reviewed. Waiting on CI.' && edited.entries[0].edited);
    const removed = await send({ type: 'removeEntry', args: { id: n2.id, index: 1 } });
    check('entry remove', removed.entries.length === 1);

    // list and search
    let rows = await send({ type: 'list' });
    check('list shows the note', rows.length === 1 && rows[0].entries === 1, `${rows.length} rows`);
    rows = await send({ type: 'list', args: { query: 'waiting ci' } });
    check('search matches entry text', rows.length === 1);
    rows = await send({ type: 'list', args: { query: 'zebra' } });
    check('search excludes non-matches', rows.length === 0);

    // reminder creates an alarm
    const withRem = await send({ type: 'setReminder', args: { id: n2.id, preset: '1h' } });
    const alarm = await popup.eval(`chrome.alarms.get('remind:${n2.id}')`);
    check('reminder sets an alarm', withRem.remind && alarm && Math.abs(alarm.scheduledTime - new Date(withRem.remind).getTime()) < 2000, JSON.stringify(alarm));
    const rems = await send({ type: 'reminders' });
    check('reminders list', rems.length === 1 && rems[0].id === n2.id);
    await send({ type: 'setReminder', args: { id: n2.id, when: null } });
    check('reminder cleared', !(await popup.eval(`chrome.alarms.get('remind:${n2.id}')`)));

    // snooze closes the tab and schedules it
    const before = (await tabs()).length;
    const snoozed = await send({ type: 'snoozeTab', args: { tabId: plain.id, preset: '3h', text: 'come back to this' } });
    await sleep(400);
    const after = (await tabs()).length;
    const plainNote = (await send({ type: 'list', args: { query: 'come back' } }))[0];
    check('snooze closes the tab and creates a reminder', after === before - 1 && snoozed.when && plainNote && plainNote.remind === new Date(snoozed.when).toISOString(), `${before}->${after}`);
    // snoozing without text still leaves an entry, so the note survives the reminder firing
    await popup.eval(`chrome.windows.create({ url: ['https://snooze.test/quiet'], focused: false })`);
    await sleep(600);
    const quietTab = (await tabs()).find((t) => /snooze\.test\/quiet/.test(t.url));
    await send({ type: 'snoozeTab', args: { tabId: quietTab.id, preset: '1h' } });
    const quiet = (await send({ type: 'list', args: { query: 'snoozed until' } }))[0];
    check('snooze without text records an entry', quiet && quiet.entries === 1, JSON.stringify(quiet));
    await send({ type: 'deleteNote', args: { id: quiet.id } });

    // export and import round-trip
    const exp = await send({ type: 'export' });
    check('export zips every note', exp.count === 2 && exp.files >= exp.count && exp.base64.length > 100, `${exp.count} notes, ${exp.files} files`);
    const md = await popup.eval(`(async () => { const m = await import('./lib/notes.js'); const s = await import('./lib/store.js'); const n = await s.getNote('${n2.id}'); return m.toMarkdown(n); })()`);
    check('markdown has frontmatter and a dated heading', /^---\ntitle: /.test(md) && /## \d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(md));
    await send({ type: 'deleteNote', args: { id: n2.id } });
    check('delete removes the note', (await send({ type: 'list' })).length === 1);
    const imp = await send({ type: 'import', args: { files: [{ name: 'x.md', text: md }, { name: 'bad.md', text: 'nope' }] } });
    check('import restores from markdown and reports bad files', imp.imported === 1 && imp.errors.length === 1, JSON.stringify(imp));
    const restored = await send({ type: 'get', args: { id: n2.id } });
    check('restored note has its entry', restored && restored.entries.length === 1 && restored.entries[0].text === 'Reviewed. Waiting on CI.');
    // importing the same file again over the existing note must not duplicate entries
    const again = await send({ type: 'import', args: { files: [{ name: 'x.md', text: md }] } });
    const afterAgain = await send({ type: 'get', args: { id: n2.id } });
    check('re-import merges without duplicating entries', again.merged === 1 && afterAgain.entries.length === 1, `${afterAgain.entries.length} entries`);
    // a past reminder in an imported file does not arm an alarm
    const pastMd = md.replace(/^updated: .*$/m, (l) => `${l}\nremind: 2020-01-01T09:00:00.000Z`);
    await send({ type: 'import', args: { files: [{ name: 'x.md', text: pastMd }] } });
    check('past reminder from import is not armed', !(await popup.eval(`chrome.alarms.get('remind:${n2.id}')`)));

    // profile intelligence: captures are supplied directly (activeTab needs a
    // real click), parsed, analysed, and diffed across visits
    const fixture = readFileSync(pjoin(EXT, 'test', 'fixtures', 'linkedin-overlap.txt'), 'utf8');
    await popup.eval(`chrome.windows.create({ url: ['http://www.linkedin.com/in/jane-doe/'], focused: false })`);
    await sleep(800);
    // HSTS preload may upgrade the scheme; match on host and path only
    const liTab = (await tabs()).find((t) => /linkedin\.com\/in\/jane-doe/.test(t.url));
    const liNote = await send({ type: 'addEntry', args: { tabId: liTab.id, title: 'Jane Doe | LinkedIn', text: 'Screening for the CSE role.', snapshot: { title: 'Jane Doe | LinkedIn', text: fixture, meta: { siteName: 'LinkedIn' } } } });
    check('linkedin capture is parsed into a structured snapshot', liNote.snapshots?.length === 1 && liNote.rule === 'LinkedIn profile', JSON.stringify({ snaps: liNote.snapshots?.length, rule: liNote.rule }));
    let ins = await send({ type: 'insights', args: { id: liNote.id } });
    check('insights analyse experience', ins.kind === 'linkedin-profile' && ins.summary?.employers === 4 && ins.findings.some((f) => f.code === 'overlap'), JSON.stringify({ kind: ins.kind, employers: ins.summary?.employers, codes: ins.findings?.map((f) => f.code) }));
    check('card line is built', /Acme Corp: Head of Things, 2023–present; Globex: Engineer → Senior Engineer/.test(ins.summary.card), ins.summary.card);
    // second visit with an edited profile: opening the popup captures again
    const editedFixture = fixture.replace('Jan 2021 - Feb 2025 · 4 yrs 2 mos', 'Jan 2021 - Feb 2023 · 2 yrs 2 mos');
    const cur2 = await send({ type: 'current', args: { tabId: liTab.id, snapshot: { title: 'Jane Doe | LinkedIn', text: editedFixture } } });
    check('popup open adds a capture', cur2.note.snapshots.length === 2 && cur2.insights.captures === 2, `${cur2.note.snapshots.length} captures`);
    check('edits between visits are detected', cur2.insights.edits?.some((e) => e.code === 'dates' && /were Jan 2021–Feb 2025, now Jan 2021–Feb 2023/.test(e.text)), JSON.stringify(cur2.insights.edits));
    check('plain text diff is reported too', cur2.insights.changed && cur2.insights.changed.addedCount === 1 && cur2.insights.changed.removedCount === 1, JSON.stringify(cur2.insights.changed));
    // an identical capture within the hour changes nothing
    const cur3 = await send({ type: 'current', args: { tabId: liTab.id, snapshot: { title: 'Jane Doe | LinkedIn', text: editedFixture } } });
    check('identical capture does not grow history', cur3.note.snapshots.length === 2 && cur3.note.snapshots[1].seen === cur3.note.snapshots[1].at);
    const detail = await send({ type: 'detail', args: { id: liNote.id } });
    check('detail returns full snapshots with text', detail.note.snapshots[0].text.length > 500 && detail.insights.profile.experience.length === 5);
    // the popup shows the insights
    await popup.eval(`chrome.tabs.update(${liTab.id}, { active: true })`);
    await popup.eval(`chrome.windows.update(${liTab.windowId}, { focused: true })`);
    await popup.eval('location.reload()');
    await sleep(1200);
    const insRows = await popup.eval(`[...document.querySelectorAll('#insights .ins')].map((r) => r.className.replace('ins ', '')).join(',')`);
    // the edited profile no longer overlaps, so there is no ask row; edit and summary remain
    check('popup renders edit and summary rows', /edit/.test(insRows) && /summary/.test(insRows), insRows);

    // capture-only note: keeps the page without an entry, survives in the index
    await popup.eval(`chrome.windows.create({ url: ['https://capture.test/page'], focused: false })`);
    await sleep(600);
    const capTab = (await tabs()).find((t) => /capture\.test\/page/.test(t.url));
    const capOnly = await send({ type: 'capture', args: { tabId: capTab.id, snapshot: { title: 'Capture', text: 'line one\nline two' } } });
    check('capture without an entry creates a note with history', capOnly.note && capOnly.note.entries.length === 0 && capOnly.note.snapshots.length === 1, JSON.stringify({ entries: capOnly.note?.entries?.length, snaps: capOnly.note?.snapshots?.length }));
    check('capture-only note is hidden from the default list', !(await send({ type: 'list' })).some((r) => r.id === capOnly.note.id));
    check('capture-only note is listed when asked', (await send({ type: 'list', args: { includeCaptures: true } })).some((r) => r.id === capOnly.note.id));

    // autosave: the editor writes today's entry, same day edits it
    await popup.eval(`chrome.windows.create({ url: ['https://draft.test/page'], focused: false })`);
    await sleep(600);
    const draftTab = (await tabs()).find((t) => /draft\.test\/page/.test(t.url));
    let d = await send({ type: 'draft', args: { tabId: draftTab.id, text: 'typing' } });
    check('draft creates today\'s entry', d.note && d.note.entries.length === 1 && d.today === 0, JSON.stringify({ entries: d.note?.entries?.length, today: d.today }));
    d = await send({ type: 'draft', args: { tabId: draftTab.id, text: 'typing more' } });
    check('draft updates today\'s entry in place', d.note.entries.length === 1 && d.note.entries[0].text === 'typing more');
    d = await send({ type: 'draft', args: { tabId: draftTab.id, text: '' } });
    check('emptying the editor removes today\'s entry', !d.note || d.note.entries.length === 0);
    d = await send({ type: 'draft', args: { tabId: draftTab.id, text: 'back again' } });
    await popup.eval(`chrome.tabs.update(${draftTab.id}, { active: true })`);
    await popup.eval(`chrome.windows.update(${draftTab.windowId}, { focused: true })`);
    await popup.eval('location.reload()');
    await sleep(1200);
    const editorValue = await popup.eval(`document.querySelector('#entry').value`);
    check('popup editor shows today\'s entry on open', editorValue === 'back again', editorValue);
    const hasSave = await popup.eval(`!!document.querySelector('#save')`);
    check('no Save button', !hasSave);
    // typing in the editor autosaves and says so
    await popup.eval(`const t = document.querySelector('#entry'); t.value = 'back again, typed'; t.dispatchEvent(new Event('input'));`);
    await sleep(1200);
    const status = await popup.eval(`document.querySelector('#status').textContent`);
    const typed = await send({ type: 'get', args: { id: d.note.id } });
    check('typing autosaves today\'s entry', /^Saved /.test(status) && typed.entries[0].text === 'back again, typed', `${status} | ${typed.entries[0]?.text}`);

    // popup renders the current note
    await popup.eval(`chrome.tabs.update(${pr.id}, { active: true })`);
    await popup.eval(`chrome.windows.update(${pr.windowId}, { focused: true })`);
    await popup.eval('location.reload()');
    await sleep(1200);
    // the PR note's only entry was written today, so it lives in the editor, not the list
    const rendered = await popup.eval(`document.querySelector('#entry').value + '|' + document.querySelectorAll('#entries .entry').length`);
    check('popup shows today\'s entry in the editor for the active page', rendered === 'Reviewed. Waiting on CI.|0', rendered);

    // stickies: anchored notes through the message API
    await popup.eval(`chrome.windows.create({ url: ['${LOCAL}/pricing'], focused: false })`);
    await sleep(800);
    const priceTab = (await tabs()).find((t) => t.url === `${LOCAL}/pricing`);
    const anchorA = { css: '#pricing > p:nth-of-type(1)', path: 'body > div:nth-of-type(1) > main:nth-of-type(1) > section:nth-of-type(1) > p:nth-of-type(1)', quote: { exact: 'Plans start at $9 per month, billed yearly.', prefix: 'Pricing ', suffix: '' }, tag: 'p', label: '' };
    const st1 = await send({ type: 'stickyAdd', args: { url: priceTab.url, title: 'Pricing – Site', anchor: anchorA, text: 'Lead with the annual price.' } });
    check('stickyAdd creates a sticky on a new note', st1 && st1.id && st1.text === 'Lead with the annual price.', JSON.stringify(st1));
    await send({ type: 'stickyUpdate', args: { url: priceTab.url, id: st1.id, text: 'Lead with the annual price, then monthly.' } });
    const st2 = await send({ type: 'stickyAdd', args: { url: priceTab.url, anchor: { ...anchorA, css: '#pricing > h2:nth-of-type(1)', quote: { exact: 'Pricing', prefix: '', suffix: '' }, tag: 'h2' } } });
    let listed = await send({ type: 'stickies', args: { url: priceTab.url } });
    check('stickies list and update', listed.length === 2 && listed[0].text === 'Lead with the annual price, then monthly.' && listed[1].text === '', JSON.stringify(listed.map((s) => s.text)));
    const priceRow = (await send({ type: 'list' })).find((r) => r.url === priceTab.url);
    check('a sticky-only note is listed with its sticky count', priceRow && priceRow.stickies === 2, JSON.stringify(priceRow));
    await sleep(500);
    check('toolbar counts sticky-only notes', await popup.eval(`chrome.action.getBadgeText({ tabId: ${priceTab.id} })`) === '2');
    check('stickies are visible by default', (await send({ type: 'stickyVisibility' })).visible === true);
    await send({ type: 'stickyVisibility', args: { visible: false } });
    check('sticky visibility is saved globally', (await send({ type: 'stickyVisibility' })).visible === false && (await popup.eval(`chrome.storage.local.get('stickies:visible')`))['stickies:visible'] === false);
    await send({ type: 'stickyVisibility', args: { visible: true } });
    const fb = await send({ type: 'feedback', args: { id: priceRow.id } });
    check('feedback export is a numbered list with quotes', /^Feedback on Pricing – Site\n/.test(fb) && /1\. "Plans start at \$9 per month, billed yearly\."\n   Lead with the annual price, then monthly\.\n2\. "Pricing"$/.test(fb), fb);
    await send({ type: 'stickyRemove', args: { url: priceTab.url, id: st2.id } });
    listed = await send({ type: 'stickies', args: { url: priceTab.url } });
    check('stickyRemove', listed.length === 1);

    // links: pages connected across sites, symmetric, by canonical key
    const linkedA = await send({ type: 'link', args: { id: n2.id, otherId: liNote.id } });
    check('link connects two pages and resolves the other side', linkedA.note.links.length === 1 && linkedA.linked.length === 1 && linkedA.linked[0].id === liNote.id && linkedA.linked[0].host === 'linkedin.com', JSON.stringify(linkedA.linked));
    const liLinks = await send({ type: 'links', args: { id: liNote.id } });
    check('a link is visible from both pages', liLinks.length === 1 && liLinks[0].id === n2.id && /github/.test(liLinks[0].host), JSON.stringify(liLinks));
    check('linking again is a no-op', (await send({ type: 'link', args: { id: n2.id, otherId: liNote.id } })).note.links.length === 1);
    const selfLink = await send({ type: 'link', args: { id: n2.id, otherId: n2.id } }).then(() => '', (e) => e.message);
    check('a page cannot link to itself', /itself/.test(selfLink), selfLink);
    check('markdown export carries links by key', /\nlinks: \[linkedin:/.test(await toMarkdownOf(n2.id)), (await toMarkdownOf(n2.id)).split('\n').find((l) => l.startsWith('links:')) || 'no links line');
    check('index rows count links', (await send({ type: 'list' })).find((r) => r.id === n2.id).links === 1);
    const linkedByUrl = await send({ type: 'link', args: { url: 'https://example.com/never-noted', title: 'Fresh page', otherId: liNote.id } });
    check('linking a page without a note creates one', linkedByUrl.note.entries.length === 0 && linkedByUrl.linked[0].id === liNote.id && (await send({ type: 'links', args: { id: liNote.id } })).length === 2, JSON.stringify(linkedByUrl.note.links));
    await send({ type: 'deleteNote', args: { id: linkedByUrl.note.id } });
    check('deleting a page removes it from the pages it was linked to', (await send({ type: 'links', args: { id: liNote.id } })).length === 1);
    const unlinked = await send({ type: 'unlink', args: { id: liNote.id, otherId: n2.id } });
    check('unlink removes both sides', unlinked.linked.length === 0 && (await send({ type: 'links', args: { id: n2.id } })).length === 0);
    await send({ type: 'link', args: { id: n2.id, otherId: liNote.id } }); // kept for the UI checks below

    // two-way vault through the in-memory folder seam: another profile's file
    // comes in, local notes go out, a deletion elsewhere propagates
    const otherMd = ['---', 'title: From another profile', 'url: https://docs.example.com/guide', 'key: https://docs.example.com/guide', 'created: 2026-10-10T09:00:00.000Z', 'updated: 2026-10-10T09:05:00.000Z', 'app: page-notes', '---', '', '## 2026-10-10 09:05', '', 'Written in profile B.', ''].join('\n');
    let vault = await send({ type: 'syncVault', args: { folder: { files: { 'from-another-profile-x.md': { text: otherMd, mtime: 1000 } } } } });
    const guideRow = (await send({ type: 'list' })).find((r) => r.url === 'https://docs.example.com/guide');
    check('vault sync imports a file written by another profile', vault.status === 'ok' && vault.report.imported === 1 && guideRow && guideRow.entries === 1, JSON.stringify(vault.report));
    check('vault sync writes this profile\'s notes and renames the file to its canonical name', vault.report.written >= 5 && Object.keys(vault.folder).some((f) => f.endsWith(`-${n2.id}.md`)) && !vault.folder['from-another-profile-x.md'] && Object.keys(vault.folder).some((f) => f.endsWith(`-${guideRow.id}.md`)), Object.keys(vault.folder).join(','));
    check('vault files carry links by key', /\nlinks: \[linkedin:/.test(vault.folder[Object.keys(vault.folder).find((f) => f.endsWith(`-${n2.id}.md`))].text));
    const steady = await send({ type: 'syncVault', args: { folder: { files: vault.folder }, state: vault.state } });
    check('a second sync over an unchanged folder reads and writes nothing', steady.report.read === 0 && steady.report.written === 0 && steady.report.imported === 0, JSON.stringify(steady.report));
    delete vault.folder[Object.keys(vault.folder).find((f) => f.endsWith(`-${guideRow.id}.md`))];
    const afterDelete = await send({ type: 'syncVault', args: { folder: { files: vault.folder }, state: vault.state } });
    check('a file deleted by another profile deletes the note here', afterDelete.report.deletedLocal === 1 && !(await send({ type: 'list' })).some((r) => r.id === guideRow.id), JSON.stringify(afterDelete.report));
    const vs = await send({ type: 'vaultStatus' });
    check('vault status records the last sync', vs.result === 'ok' && vs.at && vs.report && vs.connected === false, JSON.stringify({ result: vs.result, connected: vs.connected }));
    check('the real folder is not connected in this profile', (await send({ type: 'syncVault' })).status === 'no-vault');
    check('sync alarm is armed for this profile', !!(await popup.eval(`chrome.alarms.get('vault:sync')`)));

    // event-driven: a watcher names the changed files and the sync is scoped to them
    const scopedFolder = { ...vault.folder };
    const n2File = Object.keys(scopedFolder).find((f) => f.endsWith(`-${n2.id}.md`));
    scopedFolder[n2File] = { text: scopedFolder[n2File].text.replace(/\n## /, '\n## 2026-10-16 12:00\n\nLanded from another profile.\n\n## '), mtime: 999999 };
    const scoped = await send({ type: 'syncVault', args: { folder: { files: scopedFolder }, state: afterDelete.state, only: [n2File] } });
    check('a scoped sync reads only the reported file and merges it', scoped.report.scoped === true && scoped.report.scanned === 1 && scoped.report.read === 1 && scoped.report.updated === 1 && (await send({ type: 'get', args: { id: n2.id } })).entries.some((e) => e.text === 'Landed from another profile.'), JSON.stringify(scoped.report));
    check('pages can watch the folder; the worker reports honestly that it cannot', await popup.eval(`import('./lib/vault.js').then((v) => v.canObserve())`) === true && (await send({ type: 'vaultStatus' })).workerWatching === false);
    // the real observer, over the origin-private file system (no picker needed): the record shape we rely on
    const observed = await popup.eval(`(async () => {
        const v = await import('./lib/vault.js');
        if (!v.canObserve()) return 'unsupported';
        const dir = await navigator.storage.getDirectory();
        const seen = [];
        const observer = await v.observeHandle(dir, (c) => seen.push({ names: [...c.names], full: c.full }));
        const fh = await dir.getFileHandle('watched-note.md', { create: true });
        const w = await fh.createWritable(); await w.write('---\\ntitle: x\\n---\\n'); await w.close();
        const other = await dir.getFileHandle('ignored.txt', { create: true }); const w2 = await other.createWritable(); await w2.write('x'); await w2.close();
        for (let i = 0; i < 40 && !seen.some((c) => c.names.includes('watched-note.md')); i++) await new Promise((r) => setTimeout(r, 100));
        observer.disconnect();
        await dir.removeEntry('watched-note.md'); await dir.removeEntry('ignored.txt');
        return JSON.stringify(seen);
    })()`);
    check('FileSystemObserver reports changed Markdown files by name and ignores other files', observed !== 'unsupported' && JSON.parse(observed).some((c) => c.names.includes('watched-note.md')) && !JSON.parse(observed).some((c) => c.names.includes('ignored.txt')), observed);

    // sharing stickies as a flat file: compressed, optionally encrypted, merged on import by page identity
    const priceNoteId = (await send({ type: 'list' })).find((r) => r.url === priceTab.url).id;
    const shared = await send({ type: 'shareExport', args: { id: priceNoteId, passphrase: 'open sesame' } });
    check('shareExport produces a wrapped encrypted text file', /^-----BEGIN PAGE NOTES-----\npagenotes\/1 deflate aes-gcm\n/.test(shared.text) && shared.text.trimEnd().endsWith('-----END PAGE NOTES-----') && shared.fileName.endsWith('.pagenotes.txt') && shared.stickies === 1, shared.fileName);
    const wrongPass = await send({ type: 'shareImport', args: { text: shared.text, passphrase: 'nope' } }).then(() => '', (e) => e.message);
    check('the wrong passphrase is refused', /Wrong passphrase/.test(wrongPass), wrongPass);
    // simulate the recipient: wipe the sticky locally, then import
    const beforeImport = await send({ type: 'get', args: { id: priceNoteId } });
    await send({ type: 'stickyRemove', args: { url: priceTab.url, id: beforeImport.stickies[0].id } });
    const imported = await send({ type: 'shareImport', args: { text: shared.text, passphrase: 'open sesame', url: priceTab.url } });
    check('shareImport restores the stickies onto the recipient\'s note for that page', imported.addedStickies === 1 && imported.samePage === true && (await send({ type: 'stickies', args: { url: priceTab.url } })).length === 1, JSON.stringify(imported));
    check('importing the same share again adds nothing', (await send({ type: 'shareImport', args: { text: shared.text, passphrase: 'open sesame' } })).addedStickies === 0);
    const plainShare = await send({ type: 'shareExport', args: { id: priceNoteId, includeEntries: true } });
    check('an unencrypted share with entries decodes without a passphrase', /deflate none/.test(plainShare.text) && (await send({ type: 'shareImport', args: { text: plainShare.text } })).addedStickies === 0);
    const junk = await send({ type: 'shareImport', args: { text: 'hello there' } }).then(() => '', (e) => e.message);
    check('foreign text is rejected', /not a Page Notes share/.test(junk), junk);
    const settingsTab = await popup.eval(`chrome.tabs.create({ url: 'chrome://version/', active: false })`);
    await sleep(500);
    const annotateErr = await send({ type: 'annotate', args: { tabId: settingsTab.id, pick: true } }).then(() => '', (e) => e.message);
    check('annotate refuses non-web pages', /web pages only/.test(annotateErr), annotateErr);
    await popup.eval(`chrome.tabs.remove(${settingsTab.id})`);

    // the in-page layer, in a real DOM: load the module over http with a stubbed chrome
    const pageT = await waitFor((t) => t.url === `${LOCAL}/pricing`, 'pricing page');
    const page = await CDP.connect(pageT.webSocketDebuggerUrl);
    check('fixture page loaded from the local server', (await page.eval('document.title')) === 'Pricing – Site', await page.eval('document.title'));
    await page.eval(`
        window.__store = { stickies: ${JSON.stringify(listed)}, calls: [], visible: true };
        window.chrome = { runtime: {
            id: 'stub',
            getManifest: () => ({ name: 'Page Notes' }),
            getURL: (p) => '${LOCAL}/' + p,
            onMessage: { addListener(fn) { window.__onMessage = fn; } },
            sendMessage(msg, cb) {
                window.__store.calls.push(msg);
                const a = msg.args || {};
                if (msg.type === 'stickyVisibility') { if (typeof a.visible === 'boolean') window.__store.visible = a.visible; return cb({ ok: true, result: { visible: window.__store.visible } }); }
                if (msg.type === 'stickies') return cb({ ok: true, result: window.__store.stickies });
                if (msg.type === 'stickyAdd') { const s = { id: 's' + Date.now(), anchor: a.anchor, text: '', created: '', updated: '' }; window.__store.stickies.push(s); return cb({ ok: true, result: s }); }
                if (msg.type === 'stickyUpdate') { const s = window.__store.stickies.find((x) => x.id === a.id); if (s) s.text = a.text; return cb({ ok: true, result: true }); }
                if (msg.type === 'stickyRemove') { window.__store.stickies = window.__store.stickies.filter((x) => x.id !== a.id); return cb({ ok: true, result: true }); }
                if (msg.type === 'widgetLayout') { window.__store.layout = { ...(window.__store.layout || {}), ...(a.layout || {}) }; return cb({ ok: true, result: window.__store.layout }); }
                cb({ ok: true, result: true });
            }
        } };
        import('${LOCAL}/src/content/layer.js').then((m) => { window.__layer = m.boot(); return 'booted'; })
    `);
    await sleep(800);
    const shadowQ = (sel) => `[...document.querySelector('[data-page-notes]').shadowRoot.querySelectorAll(${JSON.stringify(sel)})]`;
    const pins = await page.eval(`${shadowQ('.pin')}.map((p) => p.textContent + ':' + p.className).join(',')`);
    check('layer renders a pin for the resolved sticky', pins === '1:pin', pins);
    const pinPos = await page.eval(`(() => { const p = ${shadowQ('.pin')}[0]; const r = document.querySelector('#pricing > p').getBoundingClientRect(); return Math.abs(parseFloat(p.style.left) - Math.min(r.left + r.width - 14, window.innerWidth - 30)) < 2 && Math.abs(parseFloat(p.style.top) - Math.max(0, r.top - 14)) < 2; })()`);
    check('pin sits at the element\'s top-right corner', pinPos === true);
    // click the pin: popover opens with the sticky text; typing autosaves through sendMessage
    await page.eval(`${shadowQ('.pin')}[0].click()`);
    await sleep(200);
    const popText = await page.eval(`${shadowQ('.pop textarea')}[0]?.value`);
    check('clicking a pin opens its popover', popText === 'Lead with the annual price, then monthly.', popText);
    await page.eval(`const ta = ${shadowQ('.pop textarea')}[0]; ta.value = 'Edited in place.'; ta.dispatchEvent(new Event('input'));`);
    await sleep(700);
    const saved = await page.eval(`window.__store.calls.filter((c) => c.type === 'stickyUpdate').pop()?.args.text`);
    check('popover edits autosave', saved === 'Edited in place.', String(saved));
    await screenshot(page, 'sticky', 1000, 700);
    await page.eval(`${shadowQ('.pop textarea')}[0].value = 'Saved while hiding'; ${shadowQ('.dock button')}[0].click();`);
    await sleep(300);
    check('hide all conceals annotations and flushes the open sticky', await page.eval(`${shadowQ('.annotations')}[0].hidden && !${shadowQ('.dock')}[0].hidden && window.__store.stickies[0].text === 'Saved while hiding' && !window.__store.visible`));
    await page.eval(`window.__layer.refresh(); true`);
    await sleep(200);
    check('hidden stickies stay hidden after refresh', await page.eval(`${shadowQ('.annotations')}[0].hidden`));
    await page.eval(`${shadowQ('.dock button')}[0].click();`);
    await sleep(100);
    check('show all restores sticky pins', await page.eval(`!${shadowQ('.annotations')}[0].hidden && window.__store.visible`));
    await page.eval(`window.__onMessage({ type: 'pn:visibility', visible: false }, {}, () => {});`);
    check('visibility broadcasts hide another open layer', await page.eval(`${shadowQ('.annotations')}[0].hidden`));
    // pick mode: hover the list item, click it, a new sticky is created with a quote anchor
    await page.eval(`window.__layer.enterPick(); true`);
    await sleep(100);
    const picked = await page.eval(`(() => {
        const li = document.querySelectorAll('#pricing li')[1];
        const r = li.getBoundingClientRect();
        document.dispatchEvent(new MouseEvent('mousemove', { clientX: r.left + 5, clientY: r.top + 5, bubbles: true }));
        document.dispatchEvent(new MouseEvent('click', { clientX: r.left + 5, clientY: r.top + 5, bubbles: true }));
        return new Promise((res) => setTimeout(() => res(window.__store.calls.filter((c) => c.type === 'stickyAdd').pop()?.args.anchor), 400));
    })()`);
    check('pick mode anchors the clicked element', picked && picked.quote.exact === 'Second point about pricing' && /li:nth-of-type\(2\)$/.test(picked.css), JSON.stringify(picked));
    await sleep(400);
    const pinsAfter = await page.eval(`${shadowQ('.pin')}.length`);
    check('new sticky gets a pin', pinsAfter === 2, String(pinsAfter));
    // an anchor whose text is gone shows as an orphan
    await page.eval(`window.__store.stickies.push({ id: 'ghost', anchor: { css: '#nowhere', path: 'body > p:nth-of-type(9)', quote: { exact: 'Text that is not on this page at all', prefix: '', suffix: '' }, tag: 'p' }, text: 'lost' }); window.__layer.refresh(); true`);
    await sleep(400);
    const orphan = await page.eval(`${shadowQ('.pin.orphan')}.length + ':' + (window.__store.calls.filter((c) => c.type === 'stickyPlacement').pop()?.args.placement.find((p) => p.id === 'ghost')?.found)`);
    check('unresolvable sticky is marked orphan and reported', orphan === '1:false', orphan);

    // a layer orphaned by an extension reload is replaced, not reused, by the bootstrap
    const rebooted = await page.eval(`(async () => {
        const hosts = () => document.querySelectorAll('[data-page-notes]').length;
        window.__pageNotesLayer = { refresh() { window.__staleRefreshed = true; }, alive: () => false };
        const before = hosts();
        const src = await (await fetch('${LOCAL}/src/content/annotate.js')).text();
        (0, eval)(src);
        await new Promise((r) => setTimeout(r, 600));
        return JSON.stringify({ before, after: hosts(), stale: !!window.__staleRefreshed, alive: window.__pageNotesLayer?.alive?.() });
    })()`);
    check('bootstrap replaces a dead layer and keeps one host', rebooted === '{"before":1,"after":1,"stale":false,"alive":true}', rebooted);
    await page.eval(`window.__layer = window.__pageNotesLayer; true`);
    await sleep(300);
    check('the fresh layer renders the stickies again', await page.eval(`${shadowQ('.pin')}.length === 3`), String(await page.eval(`${shadowQ('.pin')}.length`)));
    const kept = await page.eval(`(async () => { const h = document.querySelector('[data-page-notes]'); const src = await (await fetch('${LOCAL}/src/content/annotate.js')).text(); (0, eval)(src); await new Promise((r) => setTimeout(r, 200)); return document.querySelector('[data-page-notes]') === h; })()`);
    check('a live layer is reused by the bootstrap', kept === true);

    // floating launch mode: the worker's click handler asks the layer for the widget
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1000, height: 760, deviceScaleFactor: 1, mobile: false });
    check('no floating button before the toolbar is used in floating mode', await page.eval(`${shadowQ('.fab')}[0].hidden && ${shadowQ('.widget')}.length === 0`));
    await page.eval(`window.__store.layout = { fab: { x: 30, y: 40 } }; window.__onMessage({ type: 'pn:widget', toggle: true }, {}, () => {});`);
    await sleep(300);
    check('toolbar click shows the floating button where it was left and opens the widget', await page.eval(`!${shadowQ('.fab')}[0].hidden && ${shadowQ('.fab')}[0].style.left === '30px' && ${shadowQ('.fab')}[0].style.top === '40px' && ${shadowQ('.widget')}.length === 1 && !${shadowQ('.widget')}[0].hidden`), await page.eval(`${shadowQ('.fab')}[0].style.cssText`));
    check('widget hosts the extension\'s own panel page', (await page.eval(`${shadowQ('.widget iframe')}[0].getAttribute('src')`)) === `${LOCAL}/src/panel.html?embed=1`);
    check('widget opens beside the button', await page.eval(`(() => { const f = ${shadowQ('.fab')}[0].getBoundingClientRect(); const w = ${shadowQ('.widget')}[0].getBoundingClientRect(); return Math.abs(w.left - f.left) < 2 && w.top >= f.bottom; })()`));
    await page.eval(`window.__onMessage({ type: 'pn:widget', toggle: true }, {}, () => {});`);
    await sleep(100);
    check('a second toolbar click closes the widget and keeps the button', await page.eval(`${shadowQ('.widget')}[0].hidden && !${shadowQ('.fab')}[0].hidden`));
    // drag the button: a short press is a click (opens), a real drag moves and is remembered
    const drag = (sel, dx, dy) => page.eval(`(() => { const el = ${shadowQ(sel)}[0]; const r = el.getBoundingClientRect(); const x = r.left + 10, y = r.top + 10; const ev = (type, cx, cy) => el.dispatchEvent(new PointerEvent(type, { pointerId: 1, button: 0, clientX: cx, clientY: cy, bubbles: true })); ev('pointerdown', x, y); ev('pointermove', x + ${dx}, y + ${dy}); ev('pointerup', x + ${dx}, y + ${dy}); return [el.style.left, el.style.top].join(','); })()`);
    const tapped = await drag('.fab', 1, 1);
    await sleep(100);
    check('a tap on the floating button opens the widget', await page.eval(`!${shadowQ('.widget')}[0].hidden`) && tapped === '30px,40px', tapped);
    const dragged = await drag('.fab', 120, 60);
    await sleep(100);
    check('dragging the floating button moves it and remembers the spot', dragged === '150px,100px' && await page.eval(`window.__store.layout.fab.x === 150 && window.__store.layout.fab.y === 100 && !${shadowQ('.widget')}[0].hidden`), `${dragged} ${JSON.stringify(await page.eval('window.__store.layout'))}`);
    await screenshot(page, 'widget', 1000, 760);
    const draggedWidget = await drag('.widget .bar', 50, 30);
    check('the widget drags by its bar and remembers the spot', await page.eval(`window.__store.layout.widget && Math.abs(window.__store.layout.widget.x - parseFloat(${shadowQ('.widget')}[0].style.left)) < 1`), `${draggedWidget} ${JSON.stringify(await page.eval('window.__store.layout.widget'))}`);
    await page.eval(`${shadowQ('.widget .bar button')}[0].click()`);
    check('the widget\'s own close control hides it', await page.eval(`${shadowQ('.widget')}[0].hidden`));
    await page.eval(`window.__layer.openWidget(); true`);
    await page.eval(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    check('Esc on the page closes the widget', await page.eval(`${shadowQ('.widget')}[0].hidden`));

    // side panel: same view, follows the active tab, setting flips the icon behaviour
    check('popup offers the sidebar', await popup.eval(`!!document.querySelector('#open-panel')`));
    // on a browser page the view says there is nothing to note
    const versionTab = await popup.eval(`chrome.tabs.create({ url: 'chrome://version/', active: false })`);
    await sleep(800);
    const emptyState = await send({ type: 'current', args: { tabId: versionTab.id } });
    check('browser pages are reported but not notable', /^chrome:/.test(emptyState.tab?.url || '') && emptyState.note === null, emptyState.tab?.url);
    await popup.eval(`chrome.tabs.remove(${versionTab.id})`);
    // the panel lives in one window and follows that window's active tab
    await popup.eval(`chrome.tabs.create({ windowId: ${liTab.windowId}, url: 'chrome-extension://${extId}/src/panel.html', active: false })`);
    const panelT = await waitFor((t) => t.url.endsWith('/src/panel.html'), 'panel');
    const panel = await CDP.connect(panelT.webSocketDebuggerUrl);
    await panel.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 860, deviceScaleFactor: 1, mobile: false });
    await sleep(1200);
    // the panel refreshes asynchronously after a tab switch; poll rather than guess a delay
    const panelTitleIs = async (re) => { for (let i = 0; i < 40; i++) { const t = await panel.eval(`document.querySelector('#page-title').textContent`); if (re.test(t)) return t; await sleep(150); } return panel.eval(`document.querySelector('#page-title').textContent`); };
    await popup.eval(`chrome.tabs.update(${liTab.id}, { active: true })`);
    const panelTitle2 = await panelTitleIs(/linkedin/i);
    await popup.eval(`chrome.tabs.move(${pr.id}, { windowId: ${liTab.windowId}, index: -1 }).then(() => chrome.tabs.update(${pr.id}, { active: true }))`);
    const panelTitle1 = await panelTitleIs(/github/);
    await popup.eval(`chrome.tabs.update(${liTab.id}, { active: true })`);
    await panelTitleIs(/linkedin/i);
    check('side panel follows the active tab', /github/.test(panelTitle1) && /LinkedIn|linkedin/i.test(panelTitle2), `${panelTitle1} -> ${panelTitle2}`);
    const panelEditor = await panel.eval(`document.querySelector('#entry').value`);
    check('side panel shows today\'s entry for the active tab', panelEditor === 'Screening for the CSE role.', panelEditor);
    check('sidebar flags previously saved notes', await panel.eval(`!document.querySelector('#saved-here').hidden && /1 saved note/.test(document.querySelector('#saved-here').textContent)`));
    check('empty sticky hint flows across the card', await panel.eval(`getComputedStyle(document.querySelector('#sticky-list .empty-row')).display === 'block' && document.querySelector('#sticky-list .empty-row').getBoundingClientRect().height < 60`));

    // Retained activeTab permission must not turn automatic panel refreshes
    // into captures. Supply a snapshot on every lookup to simulate access.
    await panel.eval(`
        window.__panelSend = chrome.runtime.sendMessage.bind(chrome.runtime);
        window.__panelCalls = [];
        chrome.runtime.sendMessage = (msg, cb) => {
            window.__panelCalls.push(msg);
            if (msg.type === 'current') msg = { ...msg, args: { ...msg.args, snapshot: { title: 'Unexpected passive capture', text: 'This should never be captured by the panel.' } } };
            if (msg.type === 'draft' && window.__failDraft) {
                window.__failDraft = false;
                cb({ ok: false, error: 'Simulated save failure' });
                return;
            }
            const hold = msg.type === 'draft' && window.__holdDraft;
            if (hold) window.__holdDraft = false;
            const holdCurrent = msg.type === 'current' && window.__holdCurrent;
            if (holdCurrent) window.__holdCurrent = false;
            window.__panelSend(msg, (r) => {
                if (hold) window.__releaseDraft = () => cb(r);
                else if (holdCurrent) window.__releaseCurrent = () => cb(r);
                else cb(r);
            });
        };
    `);
    const panelWait = async (expression) => {
        for (let i = 0; i < 60; i++) {
            if (await panel.eval(expression)) return true;
            await sleep(100);
        }
        return false;
    };
    await popup.eval(`chrome.tabs.move(${draftTab.id}, { windowId: ${liTab.windowId}, index: -1 }).then(() => chrome.tabs.update(${draftTab.id}, { active: true }))`);
    check('panel loads the draft page without a passive capture', await panelWait(`document.querySelector('#entry').value === 'back again, typed' && document.querySelector('#page-url').textContent === 'draft.test/page'`));
    const panelCaptures = await send({ type: 'get', args: { id: d.note.id } });
    check('panel lookup leaves capture history untouched', !panelCaptures.snapshots?.length && await panel.eval(`window.__panelCalls.some((m) => m.type === 'current') && window.__panelCalls.filter((m) => m.type === 'current').every((m) => m.args.capture === false)`));

    // Failed text stays dirty and can be retried without another keystroke.
    await panel.eval(`window.__failDraft = true; document.querySelector('#entry').value = 'Retry this draft'; document.querySelector('#entry').dispatchEvent(new Event('blur'));`);
    check('autosave reports a failed write', await panelWait(`document.querySelector('#status').textContent === 'Simulated save failure'`));
    await panel.eval(`document.querySelector('#entry').dispatchEvent(new Event('blur'));`);
    check('unchanged text retries successfully after a failed save', await panelWait(`document.querySelector('#status').textContent.startsWith('Saved ')`) && (await send({ type: 'get', args: { id: d.note.id } })).entries[0].text === 'Retry this draft');

    // Hold a save response while the user types more and navigates the same
    // tab. Both drafts belong to the displayed page, even after its tab moves.
    await panel.eval(`window.__holdDraft = true; document.querySelector('#entry').value = 'First pending draft'; document.querySelector('#entry').dispatchEvent(new Event('blur'));`);
    check('draft save can remain in flight', await panelWait(`typeof window.__releaseDraft === 'function'`));
    await panel.eval(`document.querySelector('#entry').value = 'Last draft before navigation'; document.querySelector('#entry').dispatchEvent(new Event('input'));`);
    await popup.eval(`chrome.tabs.update(${draftTab.id}, { url: 'https://draft.test/next' })`);
    await sleep(200);
    await panel.eval(`window.__releaseDraft();`);
    check('panel follows navigation after draining pending edits', await panelWait(`document.querySelector('#page-url').textContent === 'draft.test/next' && document.querySelector('#entry').value === ''`));
    const navigationDraft = await send({ type: 'get', args: { id: d.note.id } });
    const nextPage = await send({ type: 'current', args: { tabId: draftTab.id, capture: false } });
    check('pending edits stay on the original canonical page', navigationDraft.entries[0].text === 'Last draft before navigation' && nextPage.note === null, navigationDraft.entries[0].text);

    // A slow response for an earlier tab must not replace the latest view.
    await panel.eval(`window.__holdCurrent = true;`);
    await popup.eval(`chrome.tabs.update(${liTab.id}, { active: true })`);
    check('earlier panel lookup can remain in flight', await panelWait(`typeof window.__releaseCurrent === 'function'`));
    await popup.eval(`chrome.tabs.update(${pr.id}, { active: true })`);
    check('newer panel lookup renders while an earlier one is pending', await panelWait(`document.querySelector('#page-url').textContent === 'github.com/dataro/app/pull/482'`));
    await panel.eval(`window.__releaseCurrent();`);
    check('late panel response does not replace the active page', await panel.eval(`document.querySelector('#page-url').textContent === 'github.com/dataro/app/pull/482' && document.querySelector('#entry').value === 'Reviewed. Waiting on CI.'`));
    check('automatic panel refreshes never request a capture', await panel.eval(`window.__panelCalls.filter((m) => m.type === 'current').every((m) => m.args.capture === false)`));

    // linked pages in the sidebar: the current page is the GitHub PR, linked to the LinkedIn profile above
    check('sidebar lists the linked page with its site', await panel.eval(`!document.querySelector('#linked').hidden && document.querySelectorAll('#linked-list li:not(.empty-row)').length === 1 && document.querySelector('#linked-list .host').textContent === 'linkedin.com'`), await panel.eval(`document.querySelector('#linked-list').textContent`));
    // the picker: type to find, Enter links; the linked page and this one are excluded
    await popup.eval(`chrome.tabs.create({ url: 'https://example.com/plain-two', active: false })`); // a third page to pick (its note is created below)
    await send({ type: 'addEntry', args: { url: 'https://example.com/plain-two', title: 'Plain Two', text: 'another page' } });
    await panel.eval(`document.querySelector('#add-link').click()`);
    check('+ Link opens the type-to-find picker', await panelWait(`!document.querySelector('#link-picker').hidden && document.activeElement === document.querySelector('#link-picker input')`));
    check('picker excludes this page and already linked pages', await panelWait(`document.querySelectorAll('#link-picker .picker-list li').length > 0 && ![...document.querySelectorAll('#link-picker .picker-title')].some((t) => /LinkedIn|^github\\.com$/i.test(t.textContent))`), await panel.eval(`[...document.querySelectorAll('#link-picker .picker-title')].map((t) => t.textContent).join('|')`));
    await panel.eval(`const i = document.querySelector('#link-picker input'); i.value = 'plain two'; i.dispatchEvent(new Event('input'));`);
    check('typing filters the pages', await panelWait(`document.querySelectorAll('#link-picker .picker-list li').length === 1 && document.querySelector('#link-picker .picker-title').textContent === 'Plain Two' && document.querySelector('#link-picker .picker-list li').classList.contains('active')`), await panel.eval(`document.querySelector('#link-picker .picker-status').textContent`));
    await screenshot(panel, 'sidebar-link-picker', 390, 860);
    await panel.eval(`document.querySelector('#link-picker input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))`);
    check('Enter links the highlighted page', await panelWait(`document.querySelector('#link-picker').hidden && document.querySelectorAll('#linked-list li:not(.empty-row)').length === 2 && [...document.querySelectorAll('#linked-list .title')].some((t) => t.textContent === 'Plain Two')`), await panel.eval(`document.querySelector('#linked-list').textContent`));
    await panel.eval(`document.querySelector('#add-link').click()`);
    await panel.eval(`document.querySelector('#link-picker input').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
    check('Esc closes the picker without closing the sidebar', await panelWait(`document.querySelector('#link-picker').hidden`) && await panel.eval(`!document.querySelector('main').hidden`));
    await panel.eval(`[...document.querySelectorAll('#linked-list li')].find((li) => li.querySelector('.title').textContent === 'Plain Two').querySelector('.x').click()`);
    check('unlink from the list', await panelWait(`document.querySelectorAll('#linked-list li:not(.empty-row)').length === 1`));
    await panel.eval(`document.querySelector('#linked-list li:not(.empty-row)').click()`);
    check('clicking a linked page shows it in the library at the page level', await panelWait(`!document.querySelector('#library').hidden && document.querySelector('#library-explorer').dataset.level === '2' && /LinkedIn/.test(document.querySelector('#library .explorer-preview h3')?.textContent || '')`), `level ${await panel.eval(`document.querySelector('#library-explorer').dataset.level`)} ${await panel.eval(`document.querySelector('#library .explorer-preview h3')?.textContent`)}`);
    check('the library preview lists linked pages too', await panelWait(`document.querySelectorAll('#library .explorer-link').length === 1 && document.querySelector('#library .explorer-link .host').textContent === 'github.com'`));
    await panel.eval(`document.querySelector('#library .explorer-link').click()`);
    check('a linked page in the preview navigates to that page', await panelWait(`document.querySelector('#library .explorer-preview h3')?.textContent === 'github.com' && document.querySelector('#library .explorer-site.selected')?.dataset.host === 'github.com'`));
    await screenshot(panel, 'sidebar-links', 390, 860);
    await panel.eval(`document.querySelector('#return-to-page').click()`);
    await panelWait(`document.querySelector('#library').hidden`);
    // leave the notebook as the later counts expect it
    const plainTwo = (await send({ type: 'list' })).find((r) => r.title === 'Plain Two');
    await send({ type: 'deleteNote', args: { id: plainTwo.id } });
    await popup.eval(`chrome.tabs.query({ url: 'https://example.com/plain-two' }).then((ts) => Promise.all(ts.map((t) => chrome.tabs.remove(t.id))))`);

    // share panel in the sidebar, on the page with stickies
    await popup.eval(`chrome.tabs.move(${priceTab.id}, { windowId: ${liTab.windowId}, index: -1 }).then(() => chrome.tabs.update(${priceTab.id}, { active: true }))`);
    check('sidebar offers Share on a page with stickies', await panelWait(`document.querySelector('#page-url').textContent.includes('/pricing') && !document.querySelector('#share-stickies').hidden`));
    await panel.eval(`document.querySelector('#share-stickies').click()`);
    check('Share opens a panel with the encoded text ready to copy', await panelWait(`!document.querySelector('#share-panel').hidden && /^-----BEGIN PAGE NOTES-----/.test(document.querySelector('#share-panel textarea').value) && /1 sticky/.test(document.querySelector('#share-panel .share-status').textContent)`), await panel.eval(`document.querySelector('#share-panel .share-status').textContent`));
    await panel.eval(`const p = document.querySelector('#share-panel input[type="password"]'); p.value = 'secret'; p.dispatchEvent(new Event('input'));`);
    check('a passphrase switches the share to encrypted', await panelWait(`/aes-gcm/.test(document.querySelector('#share-panel textarea').value) && /encrypted/.test(document.querySelector('#share-panel .share-status').textContent)`));
    const encryptedShare = await panel.eval(`document.querySelector('#share-panel textarea').value`);
    await screenshot(panel, 'sidebar-share', 390, 860);
    await panel.eval(`document.querySelector('#import-stickies').click()`);
    check('Import replaces the share panel with a paste box', await panelWait(`document.querySelector('#share-panel textarea')?.placeholder.startsWith('Paste') && document.querySelector('#share-stickies').getAttribute('aria-expanded') === 'false'`));
    await panel.eval(`document.querySelector('#share-panel textarea').value = ${JSON.stringify(encryptedShare)}; document.querySelector('#share-panel input[type="password"]').value = 'secret'; [...document.querySelectorAll('#share-panel button')].find((b) => b.textContent === 'Import').click();`);
    check('importing my own share reports nothing new', await panelWait(`/Added 0 stickies/.test(document.querySelector('#share-panel .share-status').textContent)`), await panel.eval(`document.querySelector('#share-panel .share-status').textContent`));
    await panel.eval(`[...document.querySelectorAll('#share-panel button')].find((b) => b.textContent === 'Close').click()`);
    check('the share panel closes', await panel.eval(`document.querySelector('#share-panel').hidden`));
    await popup.eval(`chrome.tabs.update(${pr.id}, { active: true })`);
    await panelWait(`document.querySelector('#page-url').textContent === 'github.com/dataro/app/pull/482'`);

    // Browse saved notes inside the sidebar without changing the active tab.
    // Back is hierarchical: page -> its site's pages -> all sites, never a toggle.
    const level = () => panel.eval(`document.querySelector('#library-explorer').dataset.level`);
    await panel.eval(`document.querySelector('#browse-notes').click()`);
    check('sidebar back arrow lands on the current site\'s saved pages', await panelWait(`!document.querySelector('#library').hidden && document.querySelector('#library-explorer').dataset.level === '1' && document.querySelector('#library .explorer-site.selected')?.dataset.host === 'github.com' && document.querySelector('#library .explorer-page.selected')?.dataset.id === '${n2.id}'`), `level ${await level()}`);
    check('a site\'s page list is titled by the site, with no group headers', await panel.eval(`document.querySelector('#library-title').textContent === 'github.com' && document.querySelector('#library-sub').textContent === '1 saved page' && document.querySelectorAll('#library .explorer-group').length === 0 && document.querySelector('#library .explorer-pages > summary').textContent === 'github.com · 1'`), await panel.eval(`document.querySelector('#library-title').textContent + ' / ' + document.querySelector('#library-sub').textContent`));
    check('narrow library shows one level at a time', await panel.eval(`getComputedStyle(document.querySelector('#library .explorer-sites')).display === 'none' && getComputedStyle(document.querySelector('#library .explorer-pages')).display !== 'none' && getComputedStyle(document.querySelector('#library .explorer-preview')).display === 'none'`));
    check('library up arrow is offered below the top level and the return link replaces All notes', await panel.eval(`!document.querySelector('#library-up').hidden && document.querySelector('#open-all').hidden && !document.querySelector('#return-to-page').hidden`));
    await panel.eval(`document.querySelector('#library-up').click()`);
    check('up from a site\'s pages reaches all sites and hides the arrow', await panelWait(`document.querySelector('#library-explorer').dataset.level === '0' && document.querySelector('#library-up').hidden && !document.querySelector('#library').hidden`), `level ${await level()}`);
    await panel.eval(`document.querySelector('#library .explorer-site[data-host=""]').click()`);
    check('all sites lists every saved page', await panelWait(`document.querySelector('#library-explorer').dataset.level === '1' && document.querySelectorAll('#library .explorer-page').length === 5`), `${await panel.eval(`document.querySelectorAll('#library .explorer-page').length`)} pages`);
    check('across all sites the pages are listed by site', await panel.eval(`(() => { const groups = [...document.querySelectorAll('#library .explorer-group .explorer-label')].map((g) => g.textContent); const order = [...document.querySelectorAll('#library .explorer-list[aria-label="Saved pages"] > *')].map((n) => n.classList.contains('explorer-group') ? 'G:' + n.querySelector('.explorer-label').textContent : 'P:' + n.querySelector('.explorer-page-excerpt').textContent); return groups.length === 5 && groups.join() === [...groups].sort().join() && order[0].startsWith('G:') && order[1].startsWith('P:'); })()`), await panel.eval(`[...document.querySelectorAll('#library .explorer-group .explorer-label')].map((g) => g.textContent).join(',')`));
    check('library header names the level', await panel.eval(`document.querySelector('#library-title').textContent === 'All pages' && /5 saved pages, listed by site/.test(document.querySelector('#library-sub').textContent) && document.querySelector('#library .explorer-pages > summary').textContent === 'All pages · 5'`), await panel.eval(`document.querySelector('#library-title').textContent + ' / ' + document.querySelector('#library-sub').textContent`));
    await panel.eval(`document.querySelector('#library .explorer-page[data-id="${liNote.id}"]').click()`);
    check('sidebar previews a different saved page inline', await panelWait(`document.querySelector('#library-explorer').dataset.level === '2' && document.querySelector('#library .explorer-preview').textContent.includes('Screening for the CSE role.')`) && (await popup.eval(`chrome.tabs.query({ active: true, windowId: ${liTab.windowId} })`))[0].id === pr.id);
    check('breadcrumb names the ancestors and the page', await panel.eval(`[...document.querySelectorAll('#library .explorer-trail .crumb')].map((c) => c.textContent).join('|')`) === `All sites|All pages|${await panel.eval(`document.querySelector('#library .explorer-preview h3').textContent`)}`);
    check('library header shows the page and its site at the page level', await panel.eval(`document.querySelector('#library-title').textContent === document.querySelector('#library .explorer-preview h3').textContent && document.querySelector('#library-sub').textContent === 'linkedin.com'`), await panel.eval(`document.querySelector('#library-title').textContent + ' / ' + document.querySelector('#library-sub').textContent`));
    await screenshot(panel, 'sidebar-explorer', 390, 860, true);
    await panel.eval(`document.querySelector('#library-up').click()`);
    check('up from a page returns to its list, not to the current page', await panelWait(`document.querySelector('#library-explorer').dataset.level === '1' && !document.querySelector('#library').hidden`), `level ${await level()}`);
    await panel.eval(`document.querySelector('#library .explorer-trail .crumb').click()`);
    check('breadcrumb jumps to the top', await panelWait(`document.querySelector('#library-explorer').dataset.level === '0'`));
    await panel.eval(`document.querySelector('#return-to-page').click()`);
    check('sidebar returns to the current page by its own control', await panelWait(`document.querySelector('#library').hidden && !document.querySelector('main').hidden && document.querySelector('#page-url').textContent === 'github.com/dataro/app/pull/482' && !document.querySelector('#open-all').hidden`));
    check('sidebar has a close control', await panel.eval(`!!document.querySelector('#close-view') && getComputedStyle(document.querySelector('#close-view')).display !== 'none'`));
    await screenshot(panel, 'sidebar-current', 390, 860, true);

    // launch mode: popup, docked sidebar or the floating widget on the page
    const launchState = async () => `${(await popup.eval(`chrome.action.getPopup({})`)).replace(/^chrome-extension:\/\/[^/]+\//, '')}|${await popup.eval(`chrome.sidePanel.getPanelBehavior().then((b) => b.openPanelOnActionClick)`)}`;
    const setLaunch = async (settings) => { await popup.eval(`chrome.storage.sync.set({ settings: ${JSON.stringify(settings)} })`); await send({ type: 'settingsChanged' }); await sleep(300); };
    await setLaunch({ launch: 'sidebar' });
    check('sidebar mode clears the popup so the icon toggles the sidebar', await launchState() === '|true', await launchState());
    await setLaunch({ launch: 'floating' });
    check('floating mode clears the popup and the panel behaviour so the click reaches the worker', await launchState() === '|false', await launchState());
    await setLaunch({ openInSidePanel: true });
    check('the old sidebar switch still means the sidebar', await launchState() === '|true', await launchState());
    await setLaunch({ launch: 'popup' });
    check('popup mode restores the popup', await launchState() === 'src/popup.html|false', await launchState());
    const layout = await send({ type: 'widgetLayout', args: { layout: { fab: { x: 40, y: 50 } } } });
    const layout2 = await send({ type: 'widgetLayout', args: { layout: { widget: { x: 1, y: 2 } } } });
    check('widget layout is remembered and merged', layout.fab?.x === 40 && layout2.fab?.y === 50 && layout2.widget?.x === 1 && JSON.stringify(await send({ type: 'widgetLayout' })) === JSON.stringify(layout2), JSON.stringify(layout2));

    // the panel page embedded in the widget binds to its tab and asks the layer to close it
    await popup.eval(`chrome.tabs.create({ url: 'chrome-extension://${extId}/src/panel.html?embed=1', active: false })`);
    const embedT = await waitFor((t) => t.url.endsWith('/src/panel.html?embed=1'), 'embedded panel');
    const embed = await CDP.connect(embedT.webSocketDebuggerUrl);
    await sleep(800);
    check('embedded panel marks itself and hides its own close control', await embed.eval(`document.body.classList.contains('embed') && document.body.classList.contains('panel') && getComputedStyle(document.querySelector('#close-view')).display === 'none'`));
    await embed.eval(`window.__closeMsg = null; window.addEventListener('message', (e) => { window.__closeMsg = e.data; }); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); true`);
    let closeMsg = null;
    for (let i = 0; i < 30; i++) { closeMsg = await embed.eval(`window.__closeMsg`); if (closeMsg) break; await sleep(100); }
    check('Esc in the embedded panel asks the layer to close the widget', closeMsg?.type === 'pn:widget-close', JSON.stringify(closeMsg));
    embed.ws.close();
    await popup.eval(`chrome.tabs.query({ url: 'chrome-extension://${extId}/src/panel.html?embed=1' }).then((ts) => Promise.all(ts.map((t) => chrome.tabs.remove(t.id))))`);

    // options page lists notes
    await browser.send('Target.createTarget', { url: `chrome-extension://${extId}/src/options.html` });
    const optT = await waitFor((t) => t.url.endsWith('/src/options.html'), 'options');
    const opt = await CDP.connect(optT.webSocketDebuggerUrl);
    await sleep(1200);
    const vaultState = await opt.eval(`typeof window.showDirectoryPicker === 'function' ? 'supported:' + document.querySelector('#vault-unsupported').hidden : 'unsupported:' + document.querySelector('#vault-unsupported').hidden + ':' + document.querySelector('#vault-connect').disabled`);
    check('vault section explains itself when folder access is unavailable', vaultState === 'supported:true' || vaultState === 'unsupported:false:true', vaultState);
    const optRows = await opt.eval(`document.querySelectorAll('#note-list .explorer-page').length`);
    check('options page lists notes with entries or stickies', optRows === 5, `${optRows} rows`);
    const optWait = async (expression) => { for (let i = 0; i < 50; i++) { if (await opt.eval(expression)) return true; await sleep(100); } return false; };
    await opt.eval(`document.querySelector('.explorer-site[data-host="linkedin.com"]').click()`);
    check('explorer groups pages by site and previews notes', await optWait(`document.querySelectorAll('.explorer-page').length === 1 && document.querySelector('.explorer-preview').textContent.includes('Screening for the CSE role.')`));
    await opt.eval(`document.querySelector('.explorer-site[data-host=""]').click(); document.querySelector('.explorer-page[data-id="${priceRow.id}"]').click();`);
    check('explorer previews sticky-only pages without calling them capture-only', await optWait(`document.querySelector('.explorer-preview').textContent.includes('Lead with the annual price, then monthly.')`) && await opt.eval(`document.querySelector('.explorer-page[data-id="${priceRow.id}"]').textContent.includes('1 sticky')`));
    await opt.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
    check('wide explorer expands both navigation columns after resizing', await optWait(`document.querySelector('.explorer-sites').open && document.querySelector('.explorer-pages').open`));
    await screenshot(opt, 'explorer-light', 1440, 900);
    await screenshot(opt, 'explorer-dark', 1440, 900, true);
    if (process.env.E2E_SCREENSHOTS) { await opt.eval(`document.querySelector('#settings').scrollIntoView(); true`); await screenshot(opt, 'settings-light', 1440, 900); await opt.eval(`window.scrollTo(0, 0); true`); }
    await opt.eval(`document.querySelector('#search').value = 'annual price'; document.querySelector('#search').dispatchEvent(new Event('input'));`);
    check('explorer search includes sticky text', await optWait(`document.querySelectorAll('.explorer-page').length === 1 && document.querySelector('.explorer-page').dataset.id === '${priceRow.id}'`));
    await opt.eval(`document.querySelector('#search').value = 'no matches for this phrase'; document.querySelector('#search').dispatchEvent(new Event('input'));`);
    check('explorer has a useful empty search state', await optWait(`document.querySelectorAll('.explorer-page').length === 0 && document.querySelector('.explorer-preview').textContent.includes('No matching notes')`));
    await opt.eval(`document.querySelector('#search').value = ''; document.querySelector('#search').dispatchEvent(new Event('input')); document.querySelector('#include-captures').click();`);
    check('explorer can include capture-only pages', await optWait(`document.querySelectorAll('.explorer-page').length === 6`));
    const opened = await send({ type: 'openNote', args: { id: priceRow.id, page: true } });
    const tabReaches = async (id, url) => { for (let i = 0; i < 40; i++) { if ((await popup.eval(`chrome.tabs.get(${id})`)).url === url) return true; await sleep(100); } return false; };
    check('openNote opens the selected saved page', await tabReaches(opened.tabId, priceTab.url));
    await popup.eval(`chrome.tabs.remove(${opened.tabId})`);
    const openedDetail = await send({ type: 'openNote', args: { id: priceRow.id } });
    check('openNote can open full note details', await tabReaches(openedDetail.tabId, `chrome-extension://${extId}/src/note.html?id=${priceRow.id}`));
    const detailTarget = await waitFor((t) => t.url.endsWith(`/src/note.html?id=${priceRow.id}`), 'sticky details');
    const stickyDetail = await CDP.connect(detailTarget.webSocketDebuggerUrl);
    let hasSticky = false;
    for (let i = 0; i < 40; i++) { hasSticky = await stickyDetail.eval(`document.querySelector('#stickies')?.textContent.includes('Lead with the annual price, then monthly.')`); if (hasSticky) break; await sleep(100); }
    check('full details include saved sticky comments', hasSticky);
    stickyDetail.ws.close();
    await popup.eval(`chrome.tabs.remove(${openedDetail.tabId})`);
} catch (e) {
    console.error('E2E ERROR', e);
    failures++;
} finally {
    chrome.kill('SIGKILL');
    await sleep(300);
    rmSync(profile, { recursive: true, force: true });
    server.close();
    console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL PASSED');
    process.exit(failures ? 1 : 0);
}
