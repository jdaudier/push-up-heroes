import React from 'react';
import Head from 'next/head';
import Nav from './nav';
import {Grid} from 'semantic-ui-react';

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

function Layout(props) {
    return (
        <div>
            <Head>
                <title>Push-Up Heroes</title>
                <link rel='icon' href='/favicon.ico' />
            </Head>
            <Nav showInfoModal={props.showInfoModal} />
            <Grid container stackable verticalAlign='middle' style={{ paddingTop: '9em', paddingBottom: '4em' }}>
                <Grid.Row>
                    <Grid.Column>
                        {props.children}
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <style jsx global>{`
                body { 
                    background-color: #f2f5f7;
                    background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2355acee' fill-opacity='0.19' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
                }
                @media(max-width: 767px) {
                    .ui.table tr > th.mobile-hidden {
                        display: none !important;
                    }
                     .ui.table tr > td.mobile-hidden {
                        display: none !important;
                    }
                    .mobile-hidden + td {
                        font-weight: 700;
                    }
                }
            `}</style>
        </div>
    )
}

export default Layout;
