import React from 'react';
import Head from 'next/head';

import css from '../styles/common.module.scss';

function BasePage(WrappedComponent) {
    return class extends React.Component {
        constructor(props) {
            super(props);
        }

        render() {
            return (
                <div className={css.page}>
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
                        <WrappedComponent page={this} />
                    </main>
                </div>
            );
        }
    };
}

export default BasePage;
