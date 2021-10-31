import React from 'react';
import Link from 'next/link';
import {Header, Menu, Container} from 'semantic-ui-react';
import SuperGirl from './SuperGirl';
import InstructionsModal from './InstructionsModal';
import Code from './Code';

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

const Nav = ({showInfoModal = true}) => {
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
                <div css={{
                    alignSelf: 'center',
                    marginLeft: 'auto',
                    ['@media only screen and (max-width: 768px)']: {
                        paddingRight: '.7rem'
                    }
                }}>
                    <span css={{
                        color: 'rgba(0,0,0,.6)',
                        fontSize: '.9em',
                        ['@media only screen and (max-width: 768px)']: {
                            display: 'none'
                        }
                    }}>
                        Type <Code text="/instructions" />{" "}in Slack to get started
                    </span>
                    {showInfoModal && <InstructionsModal />}
                </div>
            </Container>
        </Menu>
    );
};

export default Nav
