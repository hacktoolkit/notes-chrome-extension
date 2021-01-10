import {
    canAccessStorage,
    deleteAllNotesFromStorage,
    deleteNotesForUrlFromStorage,
    getAllStoredNotesFromStorage,
    getNotesForUrlFromStorage,
    saveNoteToStorage,
} from './storage/storage.js';

// Utility functions

function defaultNotesForTab(tab) {
    const defaultNotes = {
        url: tab.url,
        title: tab.title,
        image: tab.favIconUrl ? tab.favIconUrl : '',
        body: '',
    };
    return defaultNotes;
}

// Create / Update functions

function saveNote(url, details, callback, onError) {
    if (canAccessStorage()) {
        saveNoteToStorage(url, details, callback, onError);
    } else {
        if (onError) {
            onError();
        }
    }
}

// Read functions

function getAllStoredNotes(callback) {
    if (canAccessStorage()) {
        getAllStoredNotesFromStorage(callback);
    } else {
        // TODO: better error handling?
        callback({});
    }
}

function getNotesForUrl(url, notesFallback, callback) {
    if (canAccessStorage()) {
        getNotesForUrlFromStorage(url, notesFallback, callback);
    } else {
        callback(notesFallback);
    }
}

// Delete functions

function deleteNotesForUrl(url, callback, onError) {
    if (canAccessStorage()) {
        deleteNotesForUrlFromStorage(url, callback);
    } else {
        if (onError) {
            onError();
        }
    }
}

function deleteAllNotes(callback, onError) {
    if (canAccessStorage()) {
        deleteAllNotesFromStorage(callback);
    } else {
        if (onError) {
            onError();
        }
    }
}

export {
    defaultNotesForTab,
    deleteAllNotes,
    deleteNotesForUrl,
    getAllStoredNotes,
    getNotesForUrl,
    saveNote,
};
