# Page Notes

Notes in the margins of the web. A note on any page follows that page across URL variants, with dated entries, reminders, snoozed tabs, page snapshots, and Markdown export that Obsidian reads natively.

Vanilla JavaScript, Manifest V3, no build step, no dependencies, no server. Nothing leaves your browser. Works in Chrome, Brave, Edge and other Chromium browsers (Chrome 121 or newer).

## What it does

- **One note per page, many dated entries.** Click the toolbar icon on any page and type. Each save is a timestamped entry. The toolbar icon shows how many entries the current page has.
- **The note follows the page.** A pull request and its Files tab, a Jira issue and its board link, a LinkedIn profile and its Experience page, a Google Doc in edit and view mode: one note. Nineteen built-in identity rules, the same engine as [Organize Tabs](https://github.com/hacktoolkit/organize-tabs-chrome-extension), editable with a live tester.
- **Capture a quote.** Select text, right-click, "Add selection to this page's note".
- **Remind me.** In an hour, tonight, tomorrow, next Monday, or at a time. The page reopens with a notification.
- **Snooze a tab.** Close it now, get it back later. Also a keyboard shortcut and a right-click item.
- **Snapshot.** The first entry on a page stores its title, description and leading text locally, so the note still makes sense if the page changes or vanishes.
- **Markdown export.** Every note is a `.md` file with YAML frontmatter. Download them all as a zip, import them back, or connect an Obsidian vault folder and have every save written straight into it.
- **Search** across titles, URLs, tags and entries.

## The note format

```markdown
---
title: "Jane Doe | LinkedIn"
url: https://www.linkedin.com/in/janedoe/
key: linkedin:in/janedoe
rule: "LinkedIn profile"
created: 2026-10-11T03:02:00.000Z
updated: 2026-10-18T22:30:00.000Z
tags: [people, sales]
remind: 2026-11-01T09:00:00.000Z
excerpt: "Jane Doe - Head of Things at Acme"
app: page-notes
---

## 2026-10-19 09:30

Renamed profile to "Jane D." Still at Acme.

## 2026-10-11 14:02

Likes cheese. Two kids, dog named Fluffy.
```

`key` is the page's canonical identity from the rules, which is what makes the note follow the page. Entries are `##` headings with a local timestamp, newest first in the file. Hand-written files with the same shape import fine, and text before the first heading becomes an undated entry.

## Privacy

Everything is stored in your browser profile with `chrome.storage.local`. No network requests, no accounts, no analytics. The page snapshot is captured only when you save a note on that page, using the `activeTab` grant that your click provides, and is never transmitted. Export and the Obsidian vault connection write files only where you choose.

## Development

```sh
make test      # unit tests: note model, Markdown round-trip, zip writer, URL rules
make e2e       # every feature in a real headless browser
make dev       # the holodeck: a throwaway profile with the extension loaded
make package   # zip for the Chrome Web Store
```

Browser testing never touches a real profile; see `AGENTS.md` for the holodeck. Loading unpacked into your real profile: `chrome://extensions`, Developer mode, **Load unpacked**, pick this folder.

### Layout

```
src/background.js      service worker: messages, presence badge, reminders, snooze, context menu, export/import
src/lib/notes.js       pure note model and Markdown (tested)
src/lib/url.js         URL identity rules, copied from Organize Tabs (tested)
src/lib/store.js       chrome.storage.local notes and index; Obsidian vault handle
src/lib/zip.js         minimal zip writer for export (tested)
src/lib/settings.js    settings in storage.sync with local fallback
src/popup.*            the note for the current page
src/options.*          all notes, reminders, backup and vault, settings, help
scripts/e2e.mjs        headless browser suite
scripts/dev.mjs        holodeck launcher
```

## History

This repository began in 2021 as "URL Notes", a Next.js app in a Manifest V2 shell. Version 1.0 is a rewrite on the Hacktoolkit extension skeleton.

## License

MIT. See LICENSE.md.
