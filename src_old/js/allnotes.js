$(function () {
    const CHROME_STORAGE_ALL_NOTES_KEY = '__ALL_NOTE_DATA__';

    let ALL_NOTES_OBJECT = {};

    const handleDeleteNoteClicked = function (event) {
        const currentTarget = event.currentTarget;
        const row = $(currentTarget).parents('tr')[0];
        const url = $(row).attr('data:url');

        delete ALL_NOTES_OBJECT[url];
        chrome.storage.sync.remove(url);

        chrome.storage.sync.set(
            { [CHROME_STORAGE_ALL_NOTES_KEY]: ALL_NOTES_OBJECT },
            function () {
                console.log('deleted: ' + url);
            }
        );
        $(row).remove();
    };

    const initEventHandlers = function () {
        $('#all-notes-table-body').on(
            'click',
            '.delete-button',
            handleDeleteNoteClicked
        );
    };

    const fetchAllPreviousNotes = function () {
        chrome.storage.sync.get([CHROME_STORAGE_ALL_NOTES_KEY], function (
            result
        ) {
            ALL_NOTES_OBJECT = result[CHROME_STORAGE_ALL_NOTES_KEY];
            console.log(ALL_NOTES_OBJECT);
            let urlListItems = [];
            for (const URL in ALL_NOTES_OBJECT) {
                urlValue = ALL_NOTES_OBJECT[URL].noteUrl;
                urlImage = ALL_NOTES_OBJECT[URL].noteImage;
                urlTitle = ALL_NOTES_OBJECT[URL].noteTitle;
                urlText = ALL_NOTES_OBJECT[URL].noteText;

                const firstColumnHTML = `<td class="col-sm-2"><p class="text-truncate"><small>${urlTitle}</small></p></td>`;
                const secondColumnHTML = `<td class="col-sm-2"><a href="${urlValue}" target="_blank"><p class="text-truncate"><small>${urlValue}</small></p></a></td>`;
                const thirdColumnHTML = `<td class="col-sm-6"><p class="text-truncate"><small>${urlText}</small></p></td>`;
                const fourthColumnHTML = `<td class="col-sm-1"><button class="btn btn-dark btn-sm delete-button" type="submit">Delete</button></td>`;
                const fifthColumnHTML = `<td class="col-sm-1"><button class="btn btn-dark btn-sm" type="submit">Edit</button></td>`;

                let urlTableItemHTML = `<tr class="row" data:url="${urlValue}">${firstColumnHTML}${secondColumnHTML}${thirdColumnHTML}${fourthColumnHTML}${fifthColumnHTML}</tr>`;
                urlListItems.push(urlTableItemHTML);
            }
            $('#all-notes-table-body').html(urlListItems.join(''));
            initEventHandlers();
        });
    };

    const init = function () {
        fetchAllPreviousNotes();
    };

    init();
});
