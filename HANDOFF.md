# Handoff: Page Notes (notes-chrome-extension)

Written 2026-10-15 for the next agent or person picking this up. Read `AGENTS.md` first (rules of the road, testing, the holodeck); this file is the state of play and the open questions.

## Where things stand

- **Branch:** `feature/v1-rewrite`, 19 commits ahead of `master`, all pushed. **PR #22** is open and up to date: https://github.com/hacktoolkit/notes-chrome-extension/pull/22
- **CI:** green on the latest commit (unit tests on Node 22 and 24, headless e2e on Chrome for Testing, packaged zip artifact).
- **Tests:** 54 unit tests (`make test`), 61 e2e checks (`make e2e`), both green locally and in CI.
- **Nothing is published.** `master` is still the 2021 Manifest V2 "URL Notes" app, which no longer loads. The store listing kit (`STORE_LISTING.md`, `promo/store/`) is ready but unused.
- The owner (Jonathan) has loaded the branch unpacked in Brave and used it. Feedback so far has all been folded in.

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
4. Options page is a solid settings page, not yet a designed one. Empty states are plain.
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
