function canAccessChromeTabs() {
    const canAccess =
        typeof chrome !== 'undefined' && typeof chrome.tabs !== 'undefined';
    return canAccess;
}

function getCurrentTab(callback) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        callback(currentTab);
    });
}

export { canAccessChromeTabs, getCurrentTab };
