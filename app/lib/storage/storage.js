import {
    canAccessChromeStorage,
    deleteAllNotesFromChromeStorage,
    deleteNotesForUrlFromChromeStorage,
    getAllStoredNotesFromChromeStorage,
    getNotesForUrlFromChromeStorage,
    saveNoteToChromeStorage,
} from './chrome_storage.js';

function canAccessStorage() {
    return canAccessChromeStorage();
}

// Create / Update functions

function saveNoteToStorage(url, details, callback, onError) {
    saveNoteToChromeStorage(url, details, callback, onError);
}

function getAllStoredNotesFromStorage(callback) {
    getAllStoredNotesFromChromeStorage(callback);
}

function getNotesForUrlFromStorage(url, notesFallback, callback) {
    getNotesForUrlFromChromeStorage(url, notesFallback, callback);
}

// Delete functions

function deleteNotesForUrlFromStorage(url, callback) {
    deleteNotesForUrlFromChromeStorage(url, callback);
}

function deleteAllNotesFromStorage(callback) {
    deleteAllNotesFromChromeStorage(callback);
}

export {
    canAccessStorage,
    deleteAllNotesFromStorage,
    deleteNotesForUrlFromStorage,
    getAllStoredNotesFromStorage,
    getNotesForUrlFromStorage,
    saveNoteToStorage,
};
