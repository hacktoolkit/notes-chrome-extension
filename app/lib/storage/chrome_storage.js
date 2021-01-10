const CHROME_STORAGE_ALL_NOTES_KEY = '__ALL_NOTE_DATA__';

function canAccessChromeStorage() {
    const canAccess =
        typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined';
    return canAccess;
}

// Create / Update functions

function saveNoteToChromeStorage(url, details, callback, onError) {
    getAllStoredNotesFromChromeStorage((allNotesObject) => {
        allNotesObject[url] = details;

        chrome.storage.sync.set(
            { [CHROME_STORAGE_ALL_NOTES_KEY]: allNotesObject },
            function () {
                callback(allNotesObject);
            }
        );
    });
}

// Read functions

function getAllStoredNotesFromChromeStorage(callback) {
    chrome.storage.sync.get([CHROME_STORAGE_ALL_NOTES_KEY], function (result) {
        const allNotesObject = result[CHROME_STORAGE_ALL_NOTES_KEY] || {};
        callback(allNotesObject);
    });
}

function getNotesForUrlFromChromeStorage(url, notesFallback, callback) {
    getAllStoredNotesFromChromeStorage((allNotesObject) => {
        const notes =
            typeof allNotesObject[url] !== 'undefined'
                ? allNotesObject[url]
                : notesFallback;
        callback(notes);
    });
}

// Delete functions

function deleteNotesForUrlFromChromeStorage(url, callback) {
    getAllStoredNotesFromChromeStorage((allNotesObject) => {
        delete allNotesObject[url];

        chrome.storage.sync.set(
            { [CHROME_STORAGE_ALL_NOTES_KEY]: allNotesObject },
            function () {
                callback(allNotesObject);
            }
        );
    });
}

function deleteAllNotesFromChromeStorage(callback) {
    chrome.storage.sync.set(
        { [CHROME_STORAGE_ALL_NOTES_KEY]: {} },
        function () {
            if (callback) {
                callback();
            }
        }
    );
}

export {
    canAccessChromeStorage,
    deleteAllNotesFromChromeStorage,
    deleteNotesForUrlFromChromeStorage,
    getAllStoredNotesFromChromeStorage,
    getNotesForUrlFromChromeStorage,
    saveNoteToChromeStorage,
};
