// End-to-end smoke test. Launches a headless Chromium-based browser with the
// extension loaded, drives it over the DevTools protocol, and asserts on real
// browser state. Network is blocked so seeded URLs stay exactly as given.
//
//   make e2e
//   BROWSER=/path/to/chromium make e2e
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
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
    '--headless=new', '--host-resolver-rules=MAP * ~NOTFOUND', '--no-first-run', '--no-default-browser-check',
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

    // export and import round-trip
    const exp = await send({ type: 'export' });
    check('export zips every note', exp.count === 2 && exp.base64.length > 100, `${exp.count} notes`);
    const md = await popup.eval(`(async () => { const m = await import('./lib/notes.js'); const s = await import('./lib/store.js'); const n = await s.getNote('${n2.id}'); return m.toMarkdown(n); })()`);
    check('markdown has frontmatter and a dated heading', /^---\ntitle: /.test(md) && /## \d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(md));
    await send({ type: 'deleteNote', args: { id: n2.id } });
    check('delete removes the note', (await send({ type: 'list' })).length === 1);
    const imp = await send({ type: 'import', args: { files: [{ name: 'x.md', text: md }, { name: 'bad.md', text: 'nope' }] } });
    check('import restores from markdown and reports bad files', imp.imported === 1 && imp.errors.length === 1, JSON.stringify(imp));
    const restored = await send({ type: 'get', args: { id: n2.id } });
    check('restored note has its entry', restored && restored.entries.length === 1 && restored.entries[0].text === 'Reviewed. Waiting on CI.');

    // popup renders the current note
    await popup.eval(`chrome.tabs.update(${pr.id}, { active: true })`);
    await popup.eval(`chrome.windows.update(${pr.windowId}, { focused: true })`);
    await popup.eval('location.reload()');
    await sleep(1200);
    const rendered = await popup.eval(`document.querySelectorAll('#entries .entry').length + ':' + document.querySelector('#page-title').textContent`);
    check('popup renders entries for the active page', /^1:/.test(rendered), rendered);

    // options page lists notes
    await browser.send('Target.createTarget', { url: `chrome-extension://${extId}/src/options.html` });
    const optT = await waitFor((t) => t.url.endsWith('/src/options.html'), 'options');
    const opt = await CDP.connect(optT.webSocketDebuggerUrl);
    await sleep(1200);
    const optRows = await opt.eval(`document.querySelectorAll('#note-list .note').length`);
    check('options page lists notes', optRows === 2, `${optRows} rows`);
} catch (e) {
    console.error('E2E ERROR', e);
    failures++;
} finally {
    chrome.kill('SIGKILL');
    await sleep(300);
    rmSync(profile, { recursive: true, force: true });
    console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL PASSED');
    process.exit(failures ? 1 : 0);
}
