import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';

import BasePopup from '../components/base_popup';
import NoteTableItem from '../components/NoteTableItem';

import { deleteNotesForUrl, getAllStoredNotes } from '../lib/notes';

import css from '../styles/common.module.scss';

const AllNotes = () => {
    const [allNotesObject, setAllNotesObject] = useState(null);

    useEffect(() => {
        getAllStoredNotes(function (allNotesObj) {
            setAllNotesObject(allNotesObj);
        });
    }, []);

    const deleteRowFromTable = (noteUrl) => {
        deleteNotesForUrl(noteUrl, (allNotesObj) => {
            setAllNotesObject(allNotesObj);
        });
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
                        <th className="col-sm-2">Actions</th>
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
