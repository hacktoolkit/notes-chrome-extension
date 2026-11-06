// Small DOM and messaging helpers shared by the popup, options and note pages.

export function send(type, args = {}) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type, args }, (r) => {
            if (chrome.runtime.lastError) reject(new Error(chrome.runtime.lastError.message));
            else if (!r || !r.ok) reject(new Error(r?.error || 'No response from the extension'));
            else resolve(r.result);
        });
    });
}

export function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
        else if (v !== undefined && v !== null && v !== false) node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of [].concat(children)) {
        if (c !== null && c !== undefined) node.append(c.nodeType ? c : document.createTextNode(c));
    }
    return node;
}

// Local wall-clock stamp: YYYY-MM-DD HH:MM
export function fmt(iso) {
    const d = new Date(iso);
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
