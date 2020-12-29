export default function canAccessChromeTabs() {
    const canAccess =
        typeof chrome !== 'undefined' && typeof chrome.tabs !== 'undefined';
    return canAccess;
}
