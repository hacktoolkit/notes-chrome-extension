$(function () {
    let CURRENT_TAB_URL = '';
    let CURRENT_TAB_TITLE = '';
    let CURRENT_TAB_ICON = '';
    let ALL_NOTES_OBJECT = {};
    const CHROME_STORAGE_ALL_NOTES_KEY = '__ALL_NOTE_DATA__';

    const fetchCurrentTabData = function () {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            CURRENT_TAB_URL = tabs[0].url;

            CURRENT_TAB_TITLE = tabs[0].title;
            CURRENT_TAB_ICON = tabs[0].favIconUrl ? tabs[0].favIconUrl : '';

            console.log(CURRENT_TAB_URL, CURRENT_TAB_TITLE, CURRENT_TAB_ICON);

            $('#currentTabURL').val(CURRENT_TAB_URL);
            $('#currentTabTitle').val(CURRENT_TAB_TITLE);
            $('#currentTabImage').attr('src', CURRENT_TAB_ICON);
        });

        chrome.storage.sync.get(
            ['CHROME_STORAGE_ALL_NOTES_KEY'],
            function (result) {
                ALL_NOTES_OBJECT = result.CHROME_STORAGE_ALL_NOTES_KEY;
                if (CURRENT_TAB_URL in ALL_NOTES_OBJECT) {
                    $('#currentTabURL').val(
                        ALL_NOTES_OBJECT[CURRENT_TAB_URL].noteUrl
                    );
                    $('#currentTabTitle').val(
                        ALL_NOTES_OBJECT[CURRENT_TAB_URL].noteTitle
                    );
                    $('#notes-content').val(
                        ALL_NOTES_OBJECT[CURRENT_TAB_URL].noteText
                    );
                }
            }
        );
    };

    const showSuccessAlert = function () {
        $('.alerts').html(
            '<div class="alert alert-success" role="alert">Saved!</div>'
        );
    };

    const showErrorAlert = function () {
        $('.alerts').html(
            '<div class="alert alert-success" role="alert">Error in Saving!</div>'
        );
    };

    const saveNotesForCurrentTab = function () {
        if (CURRENT_TAB_URL === '') {
            showErrorAlert();
        } else {
            const noteUrl = $('#currentTabURL').val();
            const noteImage = $('#currentTabImage').attr('src');
            const noteTitle = $('#currentTabTitle').val();
            const noteText = $('#notes-content').val();
            // TODO: Date and Time Properties

            const noteMetaDataObject = {
                noteUrl: noteUrl,
                noteImage: noteImage,
                noteTitle: noteTitle,
                noteText: noteText,
            };

            ALL_NOTES_OBJECT[CURRENT_TAB_URL] = noteMetaDataObject;

            chrome.storage.sync.set(
                { CURRENT_TAB_URL: noteMetaDataObject },
                function () {
                    showSuccessAlert();
                }
            );
            chrome.storage.sync.set(
                { CHROME_STORAGE_ALL_NOTES_KEY: ALL_NOTES_OBJECT },
                function () {
                    showSuccessAlert();
                }
            );
        }
    };

    const fetchAllPreviousNotes = function () {
        chrome.storage.sync.get(
            ['CHROME_STORAGE_ALL_NOTES_KEY'],
            function (result) {
                ALL_NOTES_OBJECT = result.CHROME_STORAGE_ALL_NOTES_KEY;
                console.log(ALL_NOTES_OBJECT);
                let urlListItems = [];
                for (const URL in ALL_NOTES_OBJECT) {
                    urlValue = ALL_NOTES_OBJECT[URL].noteUrl;
                    urlImage = ALL_NOTES_OBJECT[URL].noteImage;
                    urlTitle = ALL_NOTES_OBJECT[URL].noteTitle;
                    urlText = ALL_NOTES_OBJECT[URL].noteText;
                    //let urlTableItemHTML = `<tr><td>${urlTitle}</td><td>${urlValue}</td><td>${urlText}</td></tr>`;
                    let urlTableItemHTML = `<tr><td>${urlTitle}</td><td><a href=${urlValue} target="_blank">${urlValue}</a></td><td>${urlText}</td></tr>`;
                    urlListItems.push(urlTableItemHTML);
                }
                $('#all-notes-table-body').html(urlListItems.join(''));
            }
        );
    };

    const init = function () {
        fetchCurrentTabData();
        fetchAllPreviousNotes();
    };

    const initEventHandlers = function () {
        $('#save-button').click(saveNotesForCurrentTab);
    };

    init();
    initEventHandlers();
});
