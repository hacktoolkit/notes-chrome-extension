import React from 'react';
import { Button, Form, Row, Col } from 'react-bootstrap';
import Head from 'next/head';

import canAccessChromeTabs from '../lib/canAccessChromeTabs';

import BasePopup from '../components/base_popup';

class Popup extends React.Component {
    constructor(props) {
        super(props);
        //this.state = Object.assign({}, props.model.attributes);
        this.state = {};

        //this.handleChange = this.handleChange.bind(this);
    }

    handleSaveButtonClicked() {
        const popup = this.props.popup;

        if (canAccessChromeTabs()) {
            popup.saveNotesForCurrentTab();
        } else {
            popup.showSuccessAlert();
        }
    }

    render() {
        const popup = this.props.popup;

        return (
            <div className="container" id="main__add__section">
                <div className="mb-2">
                    <Row>
                        <Col sm="2" className="fill nopadding">
                            <img
                                src={popup.state.currentTabImage}
                                id="currentTabImage"
                                className="img-thumbnail"
                                alt="Tab Image"
                            />
                        </Col>

                        <Col sm="10">
                            <Form.Group controlId="currentTabUrl">
                                <Form.Label>Current URL</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={popup.state.currentTabUrl}
                                ></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="mb-2">
                        <Form.Group controlId="currentTabTitle">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                defaultValue={popup.state.currentTabTitle}
                            ></Form.Control>
                        </Form.Group>
                    </div>
                    <div className="mb-2">
                        <Form.Group controlId="currentTabNotes">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={5}
                                defaultValue={popup.state.currentTabNotes}
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
