# Page Notes

Notes in the margins of the web. A note on any page follows that page across URL variants, with dated entries, reminders, snoozed tabs, page snapshots, and Markdown export that Obsidian reads natively.

Vanilla JavaScript, Manifest V3, no build step, no dependencies, no server. Nothing leaves your browser. Works in Chrome, Brave, Edge and other Chromium browsers (Chrome 121 or newer).

## What it does

- **One note per page, many dated entries.** Click the toolbar icon on any page and type. Each save is a timestamped entry. The toolbar icon shows how many entries the current page has.
- **The note follows the page.** A pull request and its Files tab, a Jira issue and its board link, a LinkedIn profile and its Experience page, a Google Doc in edit and view mode: one note. Nineteen built-in identity rules, the same engine as [Organize Tabs](https://github.com/hacktoolkit/organize-tabs-chrome-extension), editable with a live tester.
- **Capture a quote.** Select text, right-click, "Add selection to this page's note".
- **Remind me.** In an hour, tonight, tomorrow, next Monday, or at a time. The page reopens with a notification.
- **Snooze a tab.** Close it now, get it back later. Also a keyboard shortcut and a right-click item.
- **Captures.** Every time you save a note or open the popup on a page, what the page looked like is kept locally: title, core metadata (canonical URL, site, author, published date, JSON-LD types) and the page text. Identical captures collapse into one. So you have a local history of what you actually saw, and the note still makes sense if the page changes or vanishes.
- **Changed since your last visit.** When a page differs from its previous capture, the popup says so and the note's detail page shows the added and removed lines.
- **Profile insights.** On a LinkedIn profile the capture is parsed into a work history, and the extension points out what a careful reader would ask about: two full-time roles that overlap, two current full-time roles, dates that run backwards, short stints, long gaps. It also summarises years of experience, employers and average tenure, and builds a one-line card grouped by employer with promotions in order, ready to copy. Edits to the history between visits, such as an end date that moved, are called out separately. These are prompts for a conversation, never verdicts.
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

Everything is stored in your browser profile with `chrome.storage.local`. No network requests, no accounts, no analytics. A page is captured only when you act on it, saving a note or opening the popup there, using the `activeTab` grant that your click provides, and the capture never leaves the browser. There are no background content scripts and nothing runs on pages you merely visit. Export and the Obsidian vault connection write files only where you choose.

Profile insights are computed locally from the text you captured, phrased as questions, and never make inferences about protected characteristics. Overlapping dates have ordinary explanations; the point is to know what to ask.

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
src/lib/notes.js       pure note model, captures and Markdown (tested)
src/lib/profile.js     pure profile parser, consistency analysis, edit detection, text diff (tested)
src/lib/url.js         URL identity rules, copied from Organize Tabs (tested)
src/lib/store.js       chrome.storage.local notes and index; Obsidian vault handle
src/lib/zip.js         minimal zip writer for export (tested)
src/lib/settings.js    settings in storage.sync with local fallback
src/popup.*            the note for the current page
src/options.*          all notes, reminders, backup and vault, settings, help
src/note.*             one note in full: insights, changes, entries, captures
scripts/e2e.mjs        headless browser suite
scripts/dev.mjs        holodeck launcher
```

## History

This repository began in 2021 as "URL Notes", a Next.js app in a Manifest V2 shell. Version 1.0 is a rewrite on the Hacktoolkit extension skeleton.

## License

MIT. See LICENSE.md.
