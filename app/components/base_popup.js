import React from 'react';
import { Alert, Nav, Navbar } from 'react-bootstrap';

import Head from 'next/head';

import { canAccessChromeTabs, getCurrentTab } from '../lib/chrome_tabs';
import { defaultNotesForTab, getNotesForUrl } from '../lib/notes';
import isDev from '../lib/is_dev';

import css from '../styles/common.module.scss';

function BasePopup(WrappedComponent) {
    return class extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                alert: null,
                currentTabUrl: null,
                currentNotes: null,
            };
        }

        componentDidMount() {
            if (canAccessChromeTabs()) {
                this.fetchCurrentTabData();
            }
        }

        fetchCurrentTabData() {
            const self = this;

            getCurrentTab((currentTab) => {
                const url = currentTab.url;
                self.setState({
                    currentTabUrl: url,
                });

                const notesFallback = defaultNotesForTab(currentTab);

                getNotesForUrl(url, notesFallback, (notes) => {
                    self.setState({
                        currentNotes: notes,
                    });
                });
            });
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
