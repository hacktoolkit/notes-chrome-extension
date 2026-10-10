// Launches the holodeck: a throwaway browser profile at ~/.holodeck/<browser>
// with this folder loaded as an unpacked extension and a few sample tabs.
//
//   make dev                          # Brave by default
//   BROWSER=/path/to/chromium make dev
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CANDIDATES = [
    process.env.BROWSER,
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/brave-browser'
].filter(Boolean);
const CHROME = CANDIDATES.find((c) => existsSync(c));
if (!CHROME) {
    console.error('No Chromium-based browser found. Set BROWSER=/path/to/binary (Google Chrome ignores --load-extension).');
    process.exit(2);
}
const HOLODECK = process.env.HOLODECK || join(homedir(), '.holodeck');
const slug = basename(CHROME).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-browser$/, '');
const PROFILE = join(HOLODECK, slug);
const prefs = join(PROFILE, 'Default', 'Preferences');
if (!existsSync(prefs)) {
    mkdirSync(dirname(prefs), { recursive: true });
    writeFileSync(prefs, JSON.stringify({ profile: { name: '🧪 holodeck' } }));
}
const URLS = ['https://example.com/', 'https://example.com/about', 'https://example.org/', 'chrome://newtab/', 'chrome://newtab/'];
const child = spawn(CHROME, [`--user-data-dir=${PROFILE}`, `--load-extension=${EXT}`, '--no-first-run', '--no-default-browser-check', ...URLS], { detached: true, stdio: 'ignore' });
child.unref();
console.log(`Launched ${CHROME}\nHolodeck profile: ${PROFILE}\nReload the extension at chrome://extensions after editing source.`);
