import {
    saveNoteToChromeStorage,
    getAllStoredNotesFromChromeStorage,
    getNotesForUrlFromChromeStorage,
} from './storage/chrome_storage.js';

function defaultNotesForTab(tab) {
    const defaultNotes = {
        url: tab.url,
        title: tab.title,
        image: tab.favIconUrl ? tab.favIconUrl : '',
        body: '',
    };
    return defaultNotes;
}

function saveNote(url, details, callback) {
    saveNoteToChromeStorage(url, details, callback);
}

function getAllStoredNotes(callback) {
    getAllStoredNotesFromChromeStorage(callback);
}

function getNotesForUrl(url, notesFallback, callback) {
    getNotesForUrlFromChromeStorage(url, notesFallback, callback);
}

export { defaultNotesForTab, getAllStoredNotes, saveNote, getNotesForUrl };
