import React from 'react';
import { Button } from 'react-bootstrap';

import { deleteAllNotes } from '../lib/notes';

import BasePage from '../components/base_page';

class Options extends React.Component {
    constructor(props) {
        super(props);
    }

    handleDeleteAllClicked() {
        // TODO: optionally pass in a callback method to indicate that notes were deleted
        deleteAllNotes();
    }

    render() {
        return (
            <div className="container">
                <p>
                    <b>Warning!</b>
                    <br />
                    If you press this button, all of your saved notes will be
                    deleted. This is <b>irreversible</b>.
                    <br />
                    <Button
                        variant="danger"
                        onClick={this.handleDeleteAllClicked.bind(this)}
                    >
                        Delete All Notes
                    </Button>
                </p>
                <p>
                    <a
                        href="https://www.hacktoolkit.com/notes-chrome-extension/"
                        target="_blank"
                    >
                        Learn more about URL Notes.
                    </a>
                </p>
            </div>
        );
    }
}

export default BasePage(Options);
