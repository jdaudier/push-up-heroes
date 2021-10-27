import React from 'react';
import Link from 'next/link';
import {Header, Menu, Container} from 'semantic-ui-react';
import SuperGirl from './SuperGirl';
import {useRouter} from "next/router";

/** @jsx jsx */
import { jsx } from '@emotion/core';

const Nav = () => {
    const router = useRouter();
    const id = router.query.id;

    return (
        <Menu fixed='top' className="top-nav" size="huge">
            <Container>
                <Link href="/">
                    <Menu.Item as='a' header>
                        <span css={{marginRight: '1.5em', width: 50}}>
                            <SuperGirl />
                        </span>
                        <Header as='h1' style={{fontSize: 24, marginTop: 0}}>
                            Push-Up Heroes
                        </Header>
                    </Menu.Item>
                </Link>
                {!id && (
                    <div css={{
                        alignSelf: 'center',
                        color: 'rgba(0,0,0,.6)',
                        fontSize: '.9em',
                        marginLeft: 'auto'
                    }}>
                        Type
                        <code css={{
                            backgroundColor: 'rgba(27,31,35,.05)',
                            borderRadius: 3,
                            fontSize: '95%',
                            padding: '.2em .4em',
                            marginLeft: 4,
                            marginRight: 4,
                        }}>/instructions</code>
                        {" "}in Slack to get started
                    </div>
                )}
            </Container>
        </Menu>
    );
};

export default Nav
