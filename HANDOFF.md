# Handoff: Page Notes (notes-chrome-extension)

Written 2026-10-15 for the next agent or person picking this up. Read `AGENTS.md` first (rules of the road, testing, the holodeck); this file is the state of play and the open questions.

## Where things stand

- **Branch:** `feature/v1-rewrite`. At the original handoff, 19 commits ahead of `master`, all pushed, with **PR #22** open: https://github.com/hacktoolkit/notes-chrome-extension/pull/22. The continuation below adds local, uncommitted changes.
- **CI:** green at the original handoff (unit tests on Node 22 and 24, headless e2e on Chrome for Testing, packaged zip artifact). Not rerun remotely for the local continuation.
- **Tests:** 57 unit tests (`make test`), 94 e2e checks (`make e2e`), both green locally after the continuations. Syntax checks (`make check`, now including content scripts) also pass.
- **Nothing is published.** `master` is still the 2021 Manifest V2 "URL Notes" app, which no longer loads. The store listing kit (`STORE_LISTING.md`, `promo/store/`) is ready but unused.
- The owner (Jonathan) has loaded the branch unpacked in Brave and used it. Feedback so far has all been folded in.

## Continuation: popup and side-panel reliability

Code review found that automatic panel refreshes used the same capture-enabled request as a popup opening, and pending drafts relied on a tab's current URL even after navigation. Fixed in `src/popup.js`:

- Only the initial popup lookup requests a capture. Panel navigation and storage refreshes explicitly pass `capture: false`; the toolbar-click service-worker handler still captures for the panel.
- Drafts carry the displayed page's URL and title, which the worker resolves through the existing canonical identity rules. Saves wait for any in-flight draft and drain newer text before changing pages.
- A failed save leaves the text dirty so blur can retry it. Actions that depend on saving stop on a failed save.
- Refresh responses are versioned so a late result cannot replace a newer page. Typing during a lookup is preserved. Panel events are scoped to its window and current note.
- Eleven additional browser checks cover passive captures, save failure and retry, navigation with a held save response, and out-of-order page lookups. Browser tests ran with `HOLODECK=/private/tmp/page-notes-holodeck` and blocked external DNS, using only the existing text fixtures.

This continuation did not publish or update the remote PR.

## Continuation: explorer, stickies and saved-page cues (2026-10-16)

Implemented the owner's screenshot feedback, also local and uncommitted:

- `src/lib/explorer.js` and `src/explorer.css` provide a shared Sites → Pages → Notes browser. All notes uses columns at wider sizes; the sidebar uses collapsible site/page groups and an inline preview of dated entries, stickies and captures. Search includes sticky text and quoted anchors. Selection does not open tabs; Open page and Full details are explicit actions sent to the worker via `openNote`.
- The sidebar has a back arrow beside the title to browse saved pages, and a return-to-current-page control. Opening the panel on a browser/extension page starts in the library. Full details now includes stickies too.
- Warm paper colors, folded-corner pins and a persistent on-page control distinguish stickies. `stickyVisibility` stores a global local preference and broadcasts show/hide changes to existing layers; no new host permissions or passive injection. Picking or jumping to a sticky reveals the layer again. Hiding flushes an open sticky's pending edit. The sidebar empty-sticky hint now spans the full row.
- Red toolbar badges count entries plus stickies, with a descriptive tooltip. Capture-only pages keep a neutral dot. The popup/sidebar shows a saved-note banner with a brief arrival highlight that respects reduced motion.
- A one-time service-worker startup migration cleans unread counters from existing LinkedIn note titles and index rows. It preserves canonical identity, timestamps, entries and original capture titles. Tests cover the transformation and storage migration.
- Validation: 57 unit tests, 94 e2e checks, syntax checks and whitespace checks passed. Light/dark and narrow/wide previews were inspected. To regenerate them: `HOLODECK=/private/tmp/page-notes-holodeck E2E_SCREENSHOTS=/private/tmp/page-notes-preview make e2e`.

Reload the unpacked extension and refresh existing page tabs to pick up the new in-page layer. Naming, release, drag/selection anchoring and shared review remain open.

## Continuation: hierarchical back, sidebar close, launch modes (2026-10-16)

Owner feedback from use: the sidebar back arrow looped, and the docked sidebar could not be dismissed. Also local and uncommitted:

- **Back is a hierarchy, never a toggle.** `src/lib/explorer.js` tracks a level (0 sites, 1 pages of a site, 2 a page) exposed through `root.dataset.level`, with `up()`, `focus({ host, id })`, `depth()` and an `onNavigate` callback. The narrow layout shows one level at a time; the wide one keeps three columns. The trail is a breadcrumb of buttons. In the sidebar the header arrow lands on the current site's page list, the library arrow climbs one level and hides at the top, and returning to the page is a separate footer action (`#return-to-page`). "All notes" in the footer goes to the root.
- **Sidebar close.** `#close-view` in the panel header and library header calls `window.close()`, which closes the side panel. In sidebar mode the worker now clears the action popup (`chrome.action.setPopup({ popup: '' })`) so the icon toggles the panel; a popup would otherwise take the click. Esc does not close the panel (a stray Esc while writing must not), only the popup and the widget.
- **Launch modes.** `settings.launch` is `'popup' | 'sidebar' | 'floating'` (`LAUNCH_MODES` in `settings.js`); `openInSidePanel: true` migrates to `'sidebar'` in `mergeSettings`. `applyLaunchMode()` in the worker sets the popup and the side panel behaviour; `chrome.action.onClicked` captures the page and, in floating mode, injects the layer and sends `pn:widget`. On browser or extension pages in floating mode it opens the side panel instead. Options has a three-way card selector.
- **Floating widget** in `src/content/layer.js`: a draggable `.fab` (icon, sticky count) and a draggable `.widget` window holding an iframe of `src/panel.html?embed=1`, both in the shadow root, positions remembered through the worker message `widgetLayout` (`widget:layout` in storage.local). The page cannot see into the frame. Clicking the icon again toggles the widget; Esc on the page or in the frame closes it; the frame asks the layer to close with `postMessage({ type: 'pn:widget-close' })`, accepted only from the frame's window and the extension origin. `src/panel.html` and `img/icon32.png` are web-accessible for this.
- **Embed mode in `popup.js`:** `EMBED` from the query string, body gets `embed`; bound to `chrome.tabs.getCurrent()`, follows in-page navigations of that tab, never captures (the worker did on the click), and `dismiss()` replaces `window.close()`.
- **Owner reported floating mode not working** after the above. The in-page mechanism was verified in a real headless Brave (a patched copy of the extension with a host permission on the fixture standing in for the activeTab grant; see the approach in the scratch script described here: inject, send `pn:widget`, probe the shadow root, connect to the frame target): the button appears, the frame loads the embedded panel bound to the tab, a second click closes it, and a `frame-src 'none'` CSP does not block the frame. Two upstream causes were fixed: `annotate.js` reused a layer orphaned by an extension reload (its `chrome.runtime.id` is gone, so the worker could never reach it); it now asks `alive()` and reboots, and `boot()` removes stale hosts. And the side panel fallback for non-web pages lost the click gesture behind `await loadSettings()`; the mode is now cached in the worker (`launchMode`, warmed at every worker start) and `chrome.sidePanel.open` is called synchronously. A failed launch marks the tab's badge with `!` and explains in the icon tooltip. If it still fails for the owner, ask which page and whether the badge showed `!`.
- **Pages listed by site.** Across all sites the page list has a heading per site, sorted by host; the column label and the sidebar library header name the level (All notes with counts, the site, or the page and its site).

## Continuation: linked pages (2026-10-16)

Owner's ask: link any page to any other across sites (GitHub profile to LinkedIn profile), with a type-search-filter widget over the pages with notes. Local and uncommitted:

- **Model** (`notes.js`): `note.links` is a list of the other pages' canonical keys, symmetric, written on both notes by `linkNotes` / `unlinkNotes` (pure, tested). Keys resolve to ids with `noteId(key)`, so the frontmatter line `links: [github:user:jontsai]` round-trips and survives import; `mergeNotes` unions links; `indexEntry` carries a `links` count. `store.js` keeps a note that only holds a link (a note is "empty" only without entries, reminder, captures, stickies and links).
- **Worker**: `link` (`{ id | url | tabId, otherId }`, creating the note for a never-noted page), `unlink`, `links` (resolved index rows, a deleted other side comes back as `missing` with its key), `current` returns `linked`, `deleteNote` removes the page from the pages it was linked to. Each has e2e checks.
- **Picker** (`src/lib/picker.js`): `createPagePicker({ exclude, onPick, onClose })`, a combobox over the index: loads once, filters on every typed word across title, site, URL and the latest note (`matchRows`, tested), arrows/Enter/Esc, mouse. Esc stops propagation so it does not close the popup or widget. Used in the popup/sidebar "Linked pages" section (`#add-link`), the explorer preview ("+ Link a page") and nowhere else yet; it is the widget to reuse for any choose-a-page need.
- **UI**: "Linked pages" card in popup, sidebar and widget; click a linked page to show it in the library (sidebar) or open its details (popup), ↗ opens the page, ✕ unlinks. The explorer preview lists links and navigates to them (`explorer.show(id)`); the details page lists them read-only. Obsidian-style `[[wikilinks]]` in the Markdown body would be a natural follow-up; keys in frontmatter were chosen to keep the round-trip lossless.

## Continuation: two-way vault and shareable stickies (2026-10-16)

Owner's asks: use the extension in several browser profiles with notes synced through the iCloud Drive vault folder (each profile on its own schedule, files readable by any browser; SQLite was floated for speed), and send stickies to someone as a flat file with compression and encryption, no server.

- **Format decision:** Markdown files stay the storage format. SQLite in iCloud Drive with two writers is a corruption hazard and needs a WASM dependency; speed comes from a metadata-only scan instead. `src/lib/vault.js` (pure, tested): `syncFolder(folder, store, state)` lists `{ name, mtime, size }`, reads a file only when mtime or size changed, compares by FNV hash before parsing (cloud drives re-stamp mtimes), merges with `mergeNotes`, and writes a file only when it differs from the note's serialization, so profiles converge without ping-pong. Local changes made while the vault was unreachable are caught by comparing the recorded hash with the note's current serialization. Deletions propagate both ways through the per-profile state (`vault:state`, `{ files: { name: { id, mtime, size, hash } } }`). A note's file follows its title (old name removed). Capture-only notes get no file. `memoryFolder` is the test and e2e seam (`syncVault` accepts `args.folder` and returns the folder and state); `handleFolder` wraps a FileSystemDirectoryHandle.
- **Worker:** `persist` writes through the adapter and records the file; `deleteNote` removes the file; `syncVault` is serialised and runs from a per-profile alarm (`vault:sync`, every 5 minutes), at startup, on "Sync now", after re-allowing access, and at most once a minute when the popup or panel looks at a page. `vault:status` holds the last result and report; `current` returns it so the popup can show the once-per-session "Allow" banner (`#vault-hint`, calls `requestPermission` from the page, then `syncVault`). Permission cannot be requested from the worker.
- **Sharing:** `src/lib/share.js` (pure, tested in node 22+): `sharePayload` (stickies, entries optional), `encodeShare`/`decodeShare` (JSON → deflate-raw via CompressionStream → optional PBKDF2-SHA256 (250k) + AES-256-GCM with random salt and iv → base64 at 76 columns, wrapped in BEGIN/END lines, header `pagenotes/1 deflate aes-gcm|none`), `inspectShare`, `applyShare` (stickies by id, entries by minute+text, idempotent). Worker: `shareExport { id, passphrase, includeEntries }`, `shareImport { text, passphrase, url? }` resolving the page by the recipient's rules and creating the note if needed. UI: "Share…" and "Import…" in the stickies card (popup, sidebar, widget), copy or download `.pagenotes.txt`; Settings imports a file. Anchors travel with the stickies; on a page that differs they show as orphans.
- **Event-driven sync (owner's follow-up).** `FileSystemObserver` is available in this Brave (Chromium 155) in extension pages but not in service workers; verified in the holodeck. So: `observeHandle(handle, onChanges)` and `changeCollector` in `vault.js` (pure, tested), the side panel / widget page (`popup.js`) and Settings (`options.js`) watch the vault folder while open and ask the worker for a scoped sync (`syncVault { only: [names] }`), which `syncFolder` honours by `stat`-ing just those files and handling reported deletions, skipping the write-out of unrelated notes. The worker has the same watch code (`watchVault`, re-armed on every wake) which is a no-op until a browser exposes the API to workers. The 5-minute alarm and the once-a-minute look-at-a-page sync remain the safety net. e2e drives the real observer over the origin-private file system to pin the record shape.
- Tests: 74 unit, 167 e2e checks (launch modes and the popup/behaviour pair, legacy migration, `widgetLayout`, the embedded page's Esc, the layer's button and window including drag by synthetic pointer events, and the sidebar's hierarchical navigation and close control).

## What it is

A Manifest V3 extension, vanilla JavaScript, no build step, no dependencies, no server. One note per page, with page identity from URL rules so a note on a PR shows on its Files tab. Features, all shipped on the branch:

- Editor that is today's entry, autosaving; earlier entries edit in place.
- Captures: on every popup open, the page's title, metadata and text are stored locally as history; changed-since-last-visit diff.
- Profile insights: a text-based LinkedIn parser and consistency analysis (overlapping roles, two current roles, backwards dates, short stints, gaps, truncation, stated years, edits between visits), a one-line card grouped by employer.
- Stickies: comments anchored to page elements (css path rooted at a stable id, text quote with context, structural path), an in-page layer in a shadow root, pick mode, feedback export as a numbered list with quotes.
- Reminders and snoozed tabs as one-click chips; selection capture from the context menu.
- Side panel: the same view beside the page, following the active tab.
- Markdown with YAML frontmatter: zip export with captures, import with merge, Obsidian vault folder connection.
- Options page: all notes with search, reminders, backup and vault, settings with a rules tester.

## Decisions already made (do not relitigate without the owner)

- **Name:** display name lives only in `manifest.json`; code reads it at runtime. Currently "Page Notes". The owner likes "Marginalia" (possible company name; collision: Marginalia Search, known on HN) and has not decided. Flipping is one line plus `package.json` and `README.md`.
- **Site names stay in titles.** Only leading unread counters like "(3)" are stripped. The owner asked for this explicitly.
- **Every capture is a user action.** No background content scripts, no passive collection, nothing transmitted. Per-site "always show stickies" is an explicit opt-in through optional host permissions requested from the popup. This is a product rule.
- **Insights are questions, never verdicts.** Findings are `ask` or `info` with neutral wording. Never infer intent or protected characteristics. Never reference the owner's private hiring repository anywhere in this codebase.
- **No live LinkedIn, ever, in tests or development.** Parsers are built against `test/fixtures/*.txt` only. LinkedIn's bot detection is strong and the owner forbade it.
- **Notes in `chrome.storage.local`**, settings in sync (sync is capped at 100 KB total).
- **`src/lib/url.js` is a copy** of the Organize Tabs module. Keep in sync by hand until hacktoolkit/organize-tabs-chrome-extension#12 extracts it.
- **UX bar:** "smart, responsive, minimal clicking, avoid forms, autosave, automagic", polish at the level of Airbnb, Figma, Gusto. The shared token system is `src/ui.css`; refine it, do not replace it.

## Open questions and likely next asks

1. The name (above).
2. Merge and release: tag `v1.0.0`, GitHub Release with the CI zip, bump the submodule in hacktoolkit/chrome-extensions, upload to the Chrome Web Store using `STORE_LISTING.md`. Permissions that will draw review questions: `scripting`, `notifications`, `unlimitedStorage`, `sidePanel`, and the optional host permissions; justifications are in the kit.
3. Stickies polish once used for real: drag to reposition, a sticky on a text selection rather than a whole element, export to a shareable page.
4. Options now has a responsive saved-page explorer; the remaining settings sections still use the original card layout.
5. A second site parser (GitHub profile, Crunchbase) would follow the `extractorFor` pattern in `src/lib/profile.js`, fixture first.

## How to work on it

```sh
make test        # unit, seconds
make e2e         # headless browser, every feature, about 3 minutes
make dev         # the holodeck: throwaway Brave profile with the extension loaded
make screenshots # README images and 1280x800 store screenshots
make package     # zip for the store
```

- **The holodeck** (`~/.holodeck/`) is the only place browser tests run. Never test against a real profile. See `AGENTS.md`.
- Google Chrome's branded build ignores `--load-extension`; use Brave or Chrome for Testing (CI installs the latter via `@puppeteer/browsers`).
- The e2e suite blocks DNS (`MAP * ~NOTFOUND, EXCLUDE 127.0.0.1`) and serves a fixture page plus `src/` from a local http server so the in-page layer runs in a real DOM with a stubbed `chrome.*`. Captures in e2e are supplied through `args.snapshot` because `activeTab` needs a real click.
- Pushing to hacktoolkit repos from the owner's machine needs the `jontsai` SSH key explicitly: `GIT_SSH_COMMAND="ssh -i ~/.ssh/jontsai-dataro-id_ed25519 -o IdentitiesOnly=yes" git push ...`. The agent offers another account's key first.
- Chain shell commands carefully: `make e2e 2>&1 | grep ...` exits with grep's status, so `&& git commit` after it commits on failure. Write the log to a file and test for `ALL PASSED`.

## Layout

```
manifest.json          MV3, module service worker, popup, side panel, options, commands
src/background.js      every operation: messages, badge, reminders, snooze, capture, stickies, layer injection
src/lib/notes.js       note model, today's entry, captures, stickies, Markdown round-trip, feedback export (tested)
src/lib/profile.js     LinkedIn parser, consistency analysis, edit detection, text diff (tested)
src/lib/anchor.js      how a sticky finds its element again (tested on a fake DOM)
src/lib/url.js         URL identity rules, copied from Organize Tabs (tested)
src/lib/store.js       storage.local notes and index (serialised writes), Obsidian vault handle
src/lib/settings.js    settings in sync with local fallback
src/lib/zip.js         minimal zip writer (tested)
src/lib/ui.js          el/send/fmt shared by the pages
src/content/           annotate.js bootstrap + layer.js (shadow-root pins, popover, pick mode)
src/popup.*            the note for the current page; src/panel.html is the same view for the side panel
src/note.*             one note in full: insights, changes, entries, captures
src/options.*          all notes, reminders, backup and vault, settings, help
scripts/e2e.mjs        headless browser suite; scripts/dev.mjs holodeck; scripts/screenshots.mjs
test/                  node --test suites and LinkedIn text fixtures
STORE_LISTING.md       store copy, permission justifications, privacy answers
```

## The wider picture

This extension is one of the Hacktoolkit Chrome extensions (collection repo: hacktoolkit/chrome-extensions, see its `AGENTS.md`):

- **organize-tabs-chrome-extension**: v2.1.0 in the store; reference implementation. Open: PR #13 (one-line `ui.css` fix), issue #12 (share the URL rules module).
- **skeleton-chrome-extension**: the template new extensions start from; this extension was built on it.
- **paywall-xray-chrome-extension**: next candidate for modernisation; not publishable to the store.

Blog posts about the Organize Tabs rebuild are at https://www.jontsai.com/2026/10/10/organize-tabs-2-0 and https://www.jontsai.com/2026/10/11/building-organize-tabs-2-0-with-claude-code and describe the working process the owner likes: review first, constraints from use, real browser tests, an adversarial review before shipping.
