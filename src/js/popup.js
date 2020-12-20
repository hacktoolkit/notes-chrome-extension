$(function() {
    // TODO: figure out a namespace/naming convention for special keys
    const KEY_NOTES_URLS = '__NOTES_URLS__';

    let CURRENT_URL = null;
    let NOTES_URLS = null;

    function showSuccessAlert() {
        $('.alerts').html(
            '<div class="alert alert-success" role="alert">Saved!</div>'
        );
    }

    function showErrorAlert() {
        $('.alerts').html(
            '<div class="alert alert-danger" role="alert">Fail :(</div>'
        );
    }

    function getPreviouslySavedNotes() {
        // https://developer.chrome.com/docs/extensions/reference/storage/
        chrome.storage.sync.get([KEY_NOTES_URLS, CURRENT_URL], function(result) {
            // re-populate notes for current page
            const value = result[CURRENT_URL];
            $('#notes-content').val(value);

            // re-populate all previous URLs
            const urls = result[KEY_NOTES_URLS] || {};
            NOTES_URLS = urls;

            const urlLinks = _.map(_.keys(NOTES_URLS), (url) => {
                return '<li><a href="' + url + '">' + url + '</a></li>';
            });

            $('#notes-urls').html('<ul>' + urlLinks.join('') + '</ul>');
        });
    }

    function saveNotesForPage() {
        // https://developer.chrome.com/docs/extensions/reference/storage/
        if (CURRENT_URL === null) {
            showErrorAlert();
        } else if (NOTES_URLS === null) {
            showErrorAlert();
        } else {
            const value = $('#notes-content').val();

            // TODO: encrypt the value
            // TODO: maybe also encrypt the key (url)
            const kv = {};
            kv[CURRENT_URL] = value;

            NOTES_URLS[CURRENT_URL] = true;

            kv[KEY_NOTES_URLS] = NOTES_URLS;

            chrome.storage.sync.set(kv, function() {
                console.log(CURRENT_URL, value);
                showSuccessAlert();
            });
        }
    }

    function getActiveWindowTabURL() {
        chrome.tabs.query(
            { active: true, lastFocusedWindow: true },
            (tabs) => {
                const url = tabs[0].url;

                CURRENT_URL = url;
                getPreviouslySavedNotes();
            }
        );
    }

    function initEventHandlers() {
        $('#save-button').click(saveNotesForPage);
    }

    function init() {
        getActiveWindowTabURL();
    }

    initEventHandlers();
    init();
});
