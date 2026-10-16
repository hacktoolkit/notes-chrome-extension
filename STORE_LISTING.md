# Chrome Web Store listing kit

Paste-ready copy for the dashboard. Plain-text copies are in `promo/store/`. The display name comes from `manifest.json`; this file says "Page Notes" and should be updated if the name changes.

## Store listing tab

**Summary** (from `manifest.json` → `description`, max 132 characters): see the manifest.

**Category:** Productivity → Workflow & Planning. **Language:** English.

**Detailed description:** `promo/store/description.txt`.

**Screenshots:** 1280x800, from `promo/store/` once generated.

## Privacy tab

**Single purpose:**

> Page Notes lets the user write notes attached to web pages, keeps a local record of what those pages looked like when the user was there, and reminds the user to return to pages at a chosen time.

**Permission justifications:**

| Permission | Justification |
| --- | --- |
| `tabs` | Read the current tab's URL and title to attach a note to the page, show a count on the toolbar icon, and reopen a page when a reminder fires or a snoozed tab is due. |
| `activeTab` and `scripting` | When the user opens the popup or adds a sticky on a page, read that page's title, metadata and visible text so the note keeps a local record of what the user saw, and show the in-page layer on that page: sticky pins and comments, and, if the user chose the "on the page" launch mode, a floating button that opens the note in a frame. Runs only on the user's click, on that tab, never in the background. |
| `storage` and `unlimitedStorage` | Notes and page captures are stored locally in the browser profile; captures of long pages can exceed the default quota. Settings sync with the profile. |
| `alarms` | Fire reminders and reopen snoozed tabs at the time the user chose. |
| `notifications` | Show the reminder when it fires. |
| `contextMenus` | "Add selection to this page's note" and "Snooze this tab" in the right-click menu. |
| `sidePanel` | Show the note beside the page in the browser's side panel, following the active tab. |
| Optional host permissions `https://*/*`, `http://*/*` | Only when the user ticks "Always show stickies on this site": requested for that one origin so the sticky pins can appear on every visit there without a click. Never requested otherwise. |

**Remote code:** No.

**Data usage:** The extension does not collect or transmit any user data. Notes and page captures stay in the browser's local storage. Export writes files only where the user chooses. Tick the three certifications.

**Privacy policy URL:** the README's Privacy section, https://github.com/hacktoolkit/notes-chrome-extension#privacy

## Distribution tab

Free, public, all regions.
