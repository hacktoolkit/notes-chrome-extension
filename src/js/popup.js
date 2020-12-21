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

    const init = function () {
        fetchCurrentTabData();
    };

    const initEventHandlers = function () {
        $('#save-button').click(saveNotesForCurrentTab);
    };

    init();
    initEventHandlers();
});
