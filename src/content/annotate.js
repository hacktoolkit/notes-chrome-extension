// Bootstrap injected into the page (classic script). It loads the real layer
// as a module so it can share src/lib/anchor.js with the rest of the extension.
(function () {
    if (window.__pageNotesLayer) {
        window.__pageNotesLayer.refresh();
        return;
    }
    window.__pageNotesLayer = { refresh() {} };
    import(chrome.runtime.getURL('src/content/layer.js'))
        .then((m) => { window.__pageNotesLayer = m.boot(); })
        .catch((e) => console.warn('page notes layer failed', e));
})();
