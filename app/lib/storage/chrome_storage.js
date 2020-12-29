const CHROME_STORAGE_ALL_NOTES_KEY = '__ALL_NOTE_DATA__';

function saveNoteToChromeStorage(url, details, callback) {
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

export {
    saveNoteToChromeStorage,
    getAllStoredNotesFromChromeStorage,
    getNotesForUrlFromChromeStorage,
};
