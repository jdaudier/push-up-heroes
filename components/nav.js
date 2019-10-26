import React from 'react';
import Link from 'next/link';
import { Menu, Container } from 'semantic-ui-react';
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
                        <span>
                            Push-Up Heroes
                        </span>
                    </Menu.Item>
                </Link>
            </Container>
        </Menu>
    );
};

export default Nav
