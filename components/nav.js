import React from 'react'
import Link from 'next/link'
import { Menu, Container, Image } from 'semantic-ui-react'
/** @jsx jsx */
import { jsx } from '@emotion/core';

const Nav = () => {
    return (
        <Menu fixed='top' className="top-nav" size="huge">
            <Container>
                <Link href="/">
                    <Menu.Item as='a' header>
                        <Image src='android-chrome-192x192.png' css={{ marginRight: '1.5em', width: 50 }} />
                        <span css={{color: '#303030'}}>
                            Push-Up Heroes
                        </span>
                    </Menu.Item>
                </Link>
            </Container>
        </Menu>
    );
};

export default Nav
