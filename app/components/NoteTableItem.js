import React from 'react';

const NoteTableItem = ({ noteData, deleteRowFromTable }) => {
    return (
        <div>
            <tr className="row">
                <td class="col-sm-2">
                    <p class="text-truncate">
                        <small>{noteData.title}</small>
                    </p>
                </td>
                <td class="col-sm-2">
                    <a href="${urlValue}" target="_blank">
                        <p class="text-truncate">
                            <small>{noteData.url}</small>
                        </p>
                    </a>
                </td>
                <td class="col-sm-6">
                    <p class="text-truncate">
                        <small>{noteData.body}</small>
                    </p>
                </td>
                <td class="col-sm-2">
                    <button class="btn btn-dark btn-sm" type="submit">
                        Edit
                    </button>
                    <button
                        class="btn btn-dark btn-sm delete-button"
                        type="submit"
                        onClick={() => deleteRowFromTable(noteData.url)}
                    >
                        Delete
                    </button>
                </td>
            </tr>
        </div>
    );
};

export default NoteTableItem;
