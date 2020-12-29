import React from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import Head from 'next/head';

import { canAccessChromeTabs } from '../lib/chrome_tabs';
import { saveNote } from '../lib/notes';

import BasePopup from '../components/base_popup';

class Popup extends React.Component {
    constructor(props) {
        super(props);

        this.currentTabUrlInput = React.createRef();
        this.currentTabTitleInput = React.createRef();
        this.currentTabIconImg = React.createRef();
        this.currentTabNotesInput = React.createRef();
    }

    saveNotesForCurrentTab() {
        const popup = this.props.popup;
        const self = this;

        if (popup.state.currentTabUrl === '') {
            popup.showErrorAlert();
        } else {
            const noteUrl = this.currentTabUrlInput.current.value;
            const noteTitle = this.currentTabTitleInput.current.value;
            //const noteImage = popup.state.currentTabIcon;
            const noteImage = this.currentTabIconImg.current.src;
            const noteBody = this.currentTabNotesInput.current.value;
            // TODO: Date and Time Properties

            console.log(noteUrl, noteTitle, noteImage, noteBody);

            const noteDetails = {
                url: noteUrl,
                title: noteTitle,
                image: noteImage,
                body: noteBody,
            };

            saveNote(noteUrl, noteDetails, (allNotesObject) => {
                popup.setState({ allNotesObject });
                popup.showSuccessAlert();
            });
        }
    }

    handleSaveButtonClicked() {
        const popup = this.props.popup;

        if (canAccessChromeTabs()) {
            this.saveNotesForCurrentTab();
        } else {
            popup.showSuccessAlert();
        }
    }

    render() {
        const popup = this.props.popup;
        const currentNotes = popup.state.currentNotes;

        return (
            <div className="container" id="main__add__section">
                <div className="mb-2">
                    <Row>
                        <Col sm="2" className="fill nopadding">
                            <img
                                src={currentNotes ? currentNotes.image : null}
                                id="currentTabIcon"
                                className="img-thumbnail"
                                alt="Tab Image"
                                ref={this.currentTabIconImg}
                            />
                        </Col>

                        <Col sm="10">
                            <Form.Group controlId="notesUrl">
                                <Form.Label>Current URL</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={
                                        currentNotes ? currentNotes.url : ''
                                    }
                                    ref={this.currentTabUrlInput}
                                ></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="mb-2">
                        <Form.Group controlId="notesTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                defaultValue={
                                    currentNotes ? currentNotes.title : ''
                                }
                                ref={this.currentTabTitleInput}
                            ></Form.Control>
                        </Form.Group>
                    </div>
                    <div className="mb-2">
                        <Form.Group controlId="notesBody">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                defaultValue={
                                    currentNotes ? currentNotes.body : ''
                                }
                                ref={this.currentTabNotesInput}
                            ></Form.Control>
                        </Form.Group>
                    </div>
                    <Button
                        id="save-button"
                        variant="dark"
                        onClick={this.handleSaveButtonClicked.bind(this)}
                    >
                        Save
                    </Button>
                </div>
            </div>
        );
    }
}

export default BasePopup(Popup);
