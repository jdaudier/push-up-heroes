import React from 'react';
import Link from 'next/link';
import { Header, Menu, Container } from 'semantic-ui-react';
import SuperGirl from './SuperGirl';

/** @jsx jsx */
import { jsx } from '@emotion/core';

const Nav = () => {
    return (
        <Menu fixed='top' className="top-nav" size="huge">
            <Container>
                <Link href="/">
                    <Menu.Item as='a' header>
                        <span css={{marginRight: '1.5em', width: 50}}>
                            <SuperGirl />
                        </span>
                        <Header as='h1' style={{marginTop: 0}}>
                            Push-Up Heroes
                        </Header>
                    </Menu.Item>
                </Link>
            </Container>
        </Menu>
    );
};

export default Nav
