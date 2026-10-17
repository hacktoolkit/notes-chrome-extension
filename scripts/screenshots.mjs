// Renders README images and 1280x800 Chrome Web Store screenshots from the
// holodeck: seeds notes (with a fixture profile capture), captures the popup,
// the note detail page and the options page, and composes each onto a stage.
//
//   make screenshots
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const NAME = JSON.parse(readFileSync(join(EXT, 'manifest.json'), 'utf8')).name;
const OUT = join(EXT, 'promo');
const STORE = join(OUT, 'store');
const CANDIDATES = [process.env.BROWSER, '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser', '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
const CHROME = CANDIDATES.find((c) => existsSync(c));
if (!CHROME) { console.error('No Chromium-based browser found. Set BROWSER=/path/to/binary'); process.exit(2); }
const PORT = Number(process.env.PORT) || 9339;
const HOLODECK = process.env.HOLODECK || join(homedir(), '.holodeck');
mkdirSync(join(HOLODECK, 'tmp'), { recursive: true });
mkdirSync(STORE, { recursive: true });
const profile = mkdtempSync(join(HOLODECK, 'tmp', 'notes-shots-'));
const chrome = spawn(CHROME, [`--user-data-dir=${profile}`, `--load-extension=${EXT}`, `--remote-debugging-port=${PORT}`, '--headless=new', '--host-resolver-rules=MAP * ~NOTFOUND', '--no-first-run', '--no-default-browser-check', ...(process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] : []), 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const targets = async () => (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
async function waitFor(pred, tries = 60) { for (let i = 0; i < tries; i++) { try { const t = (await targets()).find(pred); if (t) return t; } catch (e) { /* not up */ } await sleep(250); } throw new Error('timeout waiting for target'); }
class CDP {
    constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); ws.addEventListener('message', (m) => { const msg = JSON.parse(m.data); if (msg.id && this.pending.has(msg.id)) { const { res, rej } = this.pending.get(msg.id); this.pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); } }); }
    static async connect(url) { const ws = new WebSocket(url); await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; }); return new CDP(ws); }
    send(m, p = {}) { const id = ++this.id; this.ws.send(JSON.stringify({ id, method: m, params: p })); return new Promise((res, rej) => this.pending.set(id, { res, rej })); }
    async eval(e) { const r = await this.send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; }
    async shot(file, { width, height, scale = 2, dark = false }) {
        await this.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: scale, mobile: false });
        await this.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }] });
        await sleep(350);
        const r = await this.send('Page.captureScreenshot', { format: 'png' });
        writeFileSync(file, Buffer.from(r.data, 'base64'));
        return file;
    }
}
async function findExtensionId() {
    for (let i = 0; i < 60; i++) {
        let list = [];
        try { list = await targets(); } catch (e) { /* not up */ }
        for (const t of list.filter((t) => t.type === 'service_worker' && t.url.endsWith('/src/background.js'))) {
            try { const cdp = await CDP.connect(t.webSocketDebuggerUrl); const name = await cdp.eval('chrome.runtime.getManifest().name'); cdp.ws.close(); if (name === NAME) return new URL(t.url).host; } catch (e) { /* next */ }
        }
        await sleep(250);
    }
    throw new Error('extension not found');
}
function stageHtml({ png, title, caption, wide = false }) {
    const data = readFileSync(png).toString('base64');
    const icon = readFileSync(join(EXT, 'img', 'icon32.png')).toString('base64');
    return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;width:1280px;height:800px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,Helvetica,Arial,sans-serif;color:#eef0f6}
    body{background:radial-gradient(1200px 700px at 20% 0%,#2a2f52 0%,#12141c 60%,#0c0d13 100%)}
    .stage{position:relative;width:1280px;height:800px;display:flex;align-items:center;gap:40px;padding:0 64px;box-sizing:border-box}
    .text{flex:0 0 ${wide ? '1152px' : '420px'};${wide ? 'position:absolute;top:36px;left:64px;' : ''}}
    h1{margin:0 0 14px;font-size:${wide ? '34px' : '40px'};line-height:1.1;letter-spacing:-0.02em}
    p{margin:0;font-size:${wide ? '18px' : '20px'};line-height:1.45;color:#b4b9d0;max-width:${wide ? '900px' : '420px'}}
    .brand{position:absolute;left:64px;bottom:34px;display:flex;align-items:center;gap:10px;font-size:15px;color:#8f95ad}
    .brand img{width:22px;height:22px;border-radius:5px}
    .shot{${wide ? 'position:absolute;left:64px;top:140px;width:1152px;height:620px;' : 'flex:1;height:720px;'}display:flex;align-items:center;justify-content:center}
    .shot img{max-width:100%;max-height:100%;border-radius:14px;box-shadow:0 30px 80px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.08)}
    </style></head><body><div class="stage"><div class="text"><h1>${title}</h1><p>${caption}</p></div><div class="shot"><img src="data:image/png;base64,${data}"></div><div class="brand"><img src="data:image/png;base64,${icon}">${NAME}</div></div></body></html>`;
}
try {
    const extId = await findExtensionId();
    const info = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
    const browser = await CDP.connect(info.webSocketDebuggerUrl);
    await browser.send('Target.createTarget', { url: `chrome-extension://${extId}/src/popup.html`, newWindow: true, width: 360, height: 640 });
    const popupT = await waitFor((t) => t.url.endsWith('/src/popup.html'));
    const popup = await CDP.connect(popupT.webSocketDebuggerUrl);
    for (let i = 0; i < 40; i++) { if (await popup.eval(`typeof chrome !== 'undefined' && !!chrome.windows && location.protocol === 'chrome-extension:'`).catch(() => false)) break; await sleep(250); }
    const send = (type, args) => popup.eval(`new Promise((res, rej) => chrome.runtime.sendMessage({ type: ${JSON.stringify(type)}, args: ${JSON.stringify(args)} }, (r) => r && r.ok ? res(r.result) : rej(new Error(r ? r.error : 'x'))))`);
    const w = await popup.eval(`chrome.windows.create({ url: ['https://www.linkedin.com/in/janedoe/', 'https://github.com/dataro/app/pull/482/files', 'https://dataro.atlassian.net/browse/ENG-1201'], focused: true })`);
    await sleep(2000);
    const tabs = await popup.eval('chrome.tabs.query({})');
    const u = (t) => t.url || t.pendingUrl || '';
    const li = tabs.find((t) => u(t).includes('linkedin')); const pr = tabs.find((t) => u(t).includes('github')); const jira = tabs.find((t) => u(t).includes('atlassian'));
    if (!li || !pr || !jira) throw new Error(`seed tabs missing: ${tabs.map(u).join(' | ')}`);
    const fixture = readFileSync(join(EXT, 'test', 'fixtures', 'linkedin-overlap.txt'), 'utf8');
    await send('addEntry', { tabId: li.id, title: 'Jane Doe | LinkedIn', text: 'Likes cheese. Two kids, dog named Fluffy.', snapshot: { title: 'Jane Doe | LinkedIn', text: fixture, meta: { siteName: 'LinkedIn' } } });
    await send('addEntry', { tabId: li.id, text: '> "Head of Things at Acme since 2024"\nMet at the Sydney meetup. Follow up re: the Q4 budget.', snapshot: { title: 'Jane Doe | LinkedIn', text: fixture.replace('Jan 2021 - Feb 2025 · 4 yrs 2 mos', 'Jan 2021 - Feb 2023 · 2 yrs 2 mos') } });
    await send('addEntry', { tabId: pr.id, title: 'Fix consolidate target · Pull Request #482', text: 'Reviewed. Waiting on CI.' });
    await send('addEntry', { tabId: jira.id, title: '[ENG-1201] Dynamics sync retries', text: 'Blocked on the vendor. Check again Monday.' });
    const list = await send('list', {});
    const liRow = list.find((r) => r.host === 'linkedin.com');
    if (!liRow) throw new Error(`linkedin note missing: ${JSON.stringify(list.map((r) => r.host))}`);
    const liId = liRow.id;
    await send('setReminder', { id: list.find((r) => r.host.includes('atlassian')).id, preset: 'nextweek' });
    await popup.eval(`chrome.tabs.update(${li.id}, { active: true })`); await popup.eval(`chrome.windows.update(${w.id}, { focused: true })`);
    await popup.eval('location.reload()'); await sleep(1200);
    const shots = {};
    shots.popup = await popup.shot(join(OUT, 'popup.png'), { width: 360, height: 640 });
    await popup.shot(join(OUT, 'popup-dark.png'), { width: 360, height: 640, dark: true });
    await popup.eval(`chrome.tabs.update(${jira.id}, { active: true })`);
    await popup.eval('location.reload()'); await sleep(1200);
    await popup.eval(`const t = document.querySelector('#entry'); t.value = 'Blocked on the vendor. Check again Monday.'; t.dispatchEvent(new Event('input'));`); await sleep(900);
    shots.remind = await popup.shot(join(OUT, 'popup-remind.png'), { width: 360, height: 640 });
    await popup.eval(`chrome.tabs.update(${li.id}, { active: true })`);
    await popup.eval('location.reload()'); await sleep(1200);
    await browser.send('Target.createTarget', { url: `chrome-extension://${extId}/src/note.html?id=${liId}`, newWindow: true, width: 900, height: 760 });
    const noteT = await waitFor((t) => t.url.includes('/src/note.html'));
    const note = await CDP.connect(noteT.webSocketDebuggerUrl);
    await sleep(1200);
    shots.detail = await note.shot(join(OUT, 'note-detail.png'), { width: 900, height: 760, scale: 1 });
    await browser.send('Target.createTarget', { url: `chrome-extension://${extId}/src/options.html`, newWindow: true, width: 1100, height: 760 });
    const optT = await waitFor((t) => t.url.endsWith('/src/options.html'));
    const opt = await CDP.connect(optT.webSocketDebuggerUrl);
    await sleep(1200);
    shots.options = await opt.shot(join(OUT, 'options.png'), { width: 1100, height: 760, scale: 1 });
    const stages = [
        { file: '1-popup.png', png: shots.popup, title: 'A note that follows the page', caption: 'Write on any page. The note is there next time, even when the URL is different: a pull request and its Files tab, a profile and its subpages. Dated entries, a count on the icon.' },
        { file: '2-insights.png', png: shots.detail, title: 'A local record of what you saw', caption: 'Every save keeps what the page looked like. When it changes, you see what changed. On a profile, you see what a careful reader would ask about.', wide: true },
        { file: '3-remind.png', png: shots.remind, title: 'Remind me. Snooze that tab.', caption: 'Come back in an hour, tonight, tomorrow or next week. Snooze a tab: close it now, get it back later.' },
        { file: '4-notes.png', png: shots.options, title: 'Your notes are files', caption: 'Markdown with YAML frontmatter that Obsidian reads natively. Export everything as a zip, or connect a vault folder and every save lands there.', wide: true }
    ];
    for (const st of stages) {
        const html = join(profile, `${st.file}.html`);
        writeFileSync(html, stageHtml(st));
        const { targetId } = await browser.send('Target.createTarget', { url: `file://${html}`, newWindow: true, width: 1280, height: 800 });
        const t = await waitFor((x) => x.id === targetId || x.url === `file://${html}`);
        const page = await CDP.connect(t.webSocketDebuggerUrl);
        await sleep(500);
        await page.shot(join(STORE, st.file), { width: 1280, height: 800, scale: 1, dark: true });
        page.ws.close();
        console.log('wrote', join('promo/store', st.file));
    }
    console.log('wrote', Object.values(shots).map((f) => f.replace(EXT + '/', '')).join(', '));
} finally { chrome.kill('SIGKILL'); await sleep(300); rmSync(profile, { recursive: true, force: true }); }
