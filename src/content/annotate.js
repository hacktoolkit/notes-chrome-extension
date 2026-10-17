// Bootstrap injected into the page (classic script). It loads the real layer
// as a module so it can share src/lib/anchor.js with the rest of the extension.
//
// A layer left behind by an earlier version of the extension (reloaded at
// chrome://extensions while this tab stayed open) still owns the window
// global but can no longer reach the worker. Replace it rather than reuse it.
(function () {
    const existing = window.__pageNotesLayer;
    if (existing && (!existing.alive || existing.alive())) {
        existing.refresh();
        return;
    }
    window.__pageNotesLayer = { refresh() {}, alive: () => true };
    import(chrome.runtime.getURL('src/content/layer.js'))
        .then((m) => { window.__pageNotesLayer = m.boot(); })
        .catch((e) => { window.__pageNotesLayer = null; console.warn('page notes layer failed', e); });
})();
