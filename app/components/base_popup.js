import React from 'react';
import { Alert, Nav, Navbar } from 'react-bootstrap';

import Head from 'next/head';

import canAccessChromeTabs from '../lib/canAccessChromeTabs';
import isDev from '../lib/is_dev';

import css from '../styles/common.module.scss';

const CHROME_STORAGE_ALL_NOTES_KEY = '__ALL_NOTE_DATA__';

function BasePopup(WrappedComponent) {
    return class extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                alert: null,
                ALL_NOTES_OBJECT: {},
                currentTabUrl: '',
                currentTabTitle: '',
                currentTabIcon: '',
                currentTabNotes: '',
            };
        }

        componentDidMount() {
            if (canAccessChromeTabs()) {
                this.fetchCurrentTabData();
            }
        }

        fetchCurrentTabData() {
            const self = this;
            chrome.tabs.query(
                { active: true, lastFocusedWindow: true },
                (tabs) => {
                    self.setState({
                        currentTabUrl: tabs[0].url,
                        currentTabTitle: tabs[0].title,
                        currentTabIcon: tabs[0].favIconUrl
                            ? tabs[0].favIconUrl
                            : '',
                    });
                }
            );

            chrome.storage.sync.get(
                [CHROME_STORAGE_ALL_NOTES_KEY],
                function (result) {
                    const ALL_NOTES_OBJECT =
                        result[CHROME_STORAGE_ALL_NOTES_KEY] || {};

                    if (
                        typeof ALL_NOTES_OBJECT[this.state.currentTabUrl] !==
                        'undefined'
                    ) {
                        this.setState({
                            currentTabUrl:
                                ALL_NOTES_OBJECT[this.state.currentTabUrl]
                                    .noteUrl,
                            currentTabTitle:
                                ALL_NOTES_OBJECT[this.state.currentTabUrl]
                                    .noteTitle,
                            currentTabNotes:
                                ALL_NOTES_OBJECT[this.state.currentTabUrl]
                                    .noteText,
                        });
                    }
                }
            );
        }

        saveNotesForCurrentTab() {
            const self = this;

            if (CURRENT_TAB_URL === '') {
                self.showErrorAlert();
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
                    { [CURRENT_TAB_URL]: noteMetaDataObject },
                    function () {
                        self.showSuccessAlert();
                    }
                );
                chrome.storage.sync.set(
                    { [CHROME_STORAGE_ALL_NOTES_KEY]: ALL_NOTES_OBJECT },
                    function () {
                        self.showSuccessAlert();
                    }
                );
            }
        }

        addAlert(heading, message, alertType) {
            this.setState({
                alert: { heading, message, alertType },
            });
        }

        showSuccessAlert() {
            this.addAlert(
                'Winner, winner, chicken dinner!',
                'Saved successfully!',
                'success'
            );
        }

        showErrorAlert() {
            this.addAlert(
                'Oh snap! You got an error!',
                'Unable to save',
                'danger'
            );
        }

        render() {
            const extension = isDev() ? '' : '.html';

            const alertJSX = this.state.alert ? (
                <Alert
                    show="true"
                    variant={this.state.alert.alertType}
                    onClose={() => this.setState({ alert: null })}
                    dismissible
                >
                    <Alert.Heading>{this.state.alert.heading}</Alert.Heading>
                    <p>{this.state.alert.message}</p>
                </Alert>
            ) : null;

            return (
                <div className={css.popup}>
                    <Head>
                        <title>Notes Chrome Plugin</title>

                        <meta charSet="utf-8" />
                        <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1, shrink-to-fit=no"
                        />

                        <link rel="icon" href="/favicon.ico" />
                    </Head>
                    <main className={css.main}>
                        <Navbar bg="dark" variant="dark">
                            <Navbar.Brand>Note Taker</Navbar.Brand>
                            <Nav>
                                <Nav.Link href={`popup${extension}`}>
                                    Current Page
                                </Nav.Link>
                                <Nav.Link href={`allnotes${extension}`}>
                                    All Notes
                                </Nav.Link>
                            </Nav>
                        </Navbar>

                        <WrappedComponent popup={this} />
                    </main>
                    <div className="alerts">{alertJSX}</div>
                </div>
            );
        }
    };
}

export default BasePopup;
