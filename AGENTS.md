# Page Notes: notes for AI agents and contributors

Built from the Hacktoolkit Chrome extension skeleton. Vanilla JavaScript, Manifest V3, no build step, no runtime dependencies, no server. Keep it that way.

## Rules of the road

- **All operations run in the service worker.** The popup and options page send `chrome.runtime.sendMessage` and render results. Chrome closes the popup when a window is created or focused.
- **The display name lives in `manifest.json` only.** Code reads `chrome.runtime.getManifest().name`; internal identifiers (storage keys, the `app:` frontmatter token, the IndexedDB name) are fixed strings and do not change with the name.
- **One note per canonical page.** Identity comes from `identify()` in `src/lib/notes.js`, which uses the URL rules in `src/lib/url.js`. Never key anything on a raw URL.
- **Pure logic is tested.** `notes.js`, `url.js` and `zip.js` have no Chrome APIs and have `node --test` suites. Markdown round-trip (`toMarkdown` / `fromMarkdown`) must stay lossless for entries, tags, reminder and key.
- **Notes live in `chrome.storage.local`**, one item per note plus `notes:index`. Sync storage is capped at 100 KB total; only settings go there.
- **Every capture is a user action.** Snapshots use the `activeTab` grant from the user's click. No background content scripts, no passive collection, nothing transmitted. This is a product rule, not just a store rule.
- **`src/lib/url.js` is a copy** of the Organize Tabs module; see hacktoolkit/organize-tabs-chrome-extension#12 for the plan to share it. Keep changes in sync until then.
- Code style per `.prettierrc`: 4 spaces, single quotes, semicolons.

## Testing

```sh
make test      # unit
make e2e       # headless browser, every feature
make dev       # the holodeck
```

Browser testing never touches a real profile. Automated and interactive runs use the **holodeck**, a throwaway sandbox at `~/.holodeck/` (override with `HOLODECK=`): `make dev` opens a persistent profile at `~/.holodeck/<browser>/` named "🧪 holodeck"; `make e2e` creates a fresh profile under `~/.holodeck/tmp/` and removes it. Agents may launch, inspect and destroy anything under `~/.holodeck/` without asking. Google Chrome's branded build ignores `--load-extension`; the scripts default to Brave and CI uses Chrome for Testing.

When adding a message type to `background.js`, add a `check(...)` in `scripts/e2e.mjs`.

## Releasing

Bump `version` in `manifest.json` and `package.json`, `make package`, upload the zip to the Chrome Web Store dashboard.
