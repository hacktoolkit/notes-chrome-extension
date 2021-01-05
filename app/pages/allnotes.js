import React, { useState, useEffect } from 'react';
import BasePopup from '../components/base_popup';
import Table from 'react-bootstrap/Table';
import NoteTableItem from '../components/NoteTableIem';
import css from '../styles/common.module.scss';

const AllNotes = () => {
    const [allNotesObject, setAllNotesObject] = useState(null);

    useEffect(() => {
        chrome.storage.sync.get(['__ALL_NOTE_DATA__'], function (result) {
            const allNoteDataObject = result['__ALL_NOTE_DATA__'];
            setAllNotesObject(allNoteDataObject);
        });
    }, []);

    const deleteRowFromTable = (noteURL) => {
        delete allNotesObject[noteURL];
        chrome.storage.sync.remove(noteURL);

        chrome.storage.sync.set(
            { ['__ALL_NOTE_DATA__']: allNotesObject },
            function () {
                chrome.storage.sync.get(
                    ['__ALL_NOTE_DATA__'],
                    function (result) {
                        const allNoteDataObject = result['__ALL_NOTE_DATA__'];
                        setAllNotesObject(allNoteDataObject);
                    }
                );
            }
        );
    };

    return (
        <div className="all__notes">
            <Table
                className={css.all__notes__table}
                responsive
                striped
                hover
                size="sm"
            >
                <thead className="all-notes-table-header">
                    <tr className="row">
                        <th className="col-sm-2">Title</th>
                        <th className="col-sm-2">URL</th>
                        <th className="col-sm-6">Notes</th>
                        <th className="col-sm-1">Delete</th>
                        <th className="col-sm-1">Edit</th>
                    </tr>
                </thead>
                {allNotesObject ? (
                    <tbody className="all-notes-table-body">
                        {Object.keys(allNotesObject).map((urlKey) => (
                            <NoteTableItem
                                noteData={allNotesObject[urlKey]}
                                deleteRowFromTable={deleteRowFromTable}
                            />
                        ))}
                    </tbody>
                ) : (
                    <h1>Loading...</h1>
                )}
            </Table>
        </div>
    );
};

export default BasePopup(AllNotes);
