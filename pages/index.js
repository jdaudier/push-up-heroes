import React from 'react';
import Head from 'next/head';
import Nav from '../components/nav';
import { Icon, Label, Image, Menu, Table, Container, Header } from 'semantic-ui-react';
import Layout from '../components/Layout';
import withData from "../lib/apollo";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';

const MaybeRibbon = ({place}) => {
    switch (place) {
        case 1:
            return <Label color="yellow" ribbon size="big">1st!</Label>;
        default:
            return null;
    }
};

const floating = keyframes`
   from {
        transform: translateY(0px);
   }
   65% {
        transform: translateY(15px);
   }
   to {
        transform: translateY(0px);
   }
`;

const GET_LEADERBOARD = gql`
    query leaderboard { 
        leaderboard { 
            id name count 
        }
        totalPushUps
    }
`;

const EmptyView = ({message}) => {
    return (
        <div>
            <Table celled size='large' selectable textAlign="left">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>Rank</Table.HeaderCell>
                        <Table.HeaderCell>Athlete</Table.HeaderCell>
                        <Table.HeaderCell>Total Push-Ups</Table.HeaderCell>
                        <Table.HeaderCell>Catch the Leader</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    <Table.Row key="empty" textAlign="center">
                        <Table.Cell colSpan='4'>
                                <span css={{
                                    borderRadius: 4,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 20,
                                    background: 'url(/images/bg_purple.png)',
                                    backgroundRepeat: 'repeat-x',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'left top',
                                    height: '100%',
                                    overflow: 'hidden',
                                }}>
                                    <p css={{color: 'white'}}>{message}</p>

                                    <span css={{
                                        marginLeft: 45,
                                        animation: `${floating} 3s infinite ease-in-out`,
                                    }}>
                                        <Image src="https://mars-404.templateku.co/img/astronaut.svg" centered/>
                                    </span>
                                </span>
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table>
        </div>
    );
};

const Leaderboard = () => {
    const { loading, error, data, fetchMore } = useQuery(GET_LEADERBOARD, {
        notifyOnNetworkStatusChange: true
    });

    if (!data) return null;

    const {leaderboard, totalPushUps} = data;

    if (leaderboard.length === 0) {
        return <EmptyView message="No one has done any push-ups yet!" />
    }

    return (
        <Table celled size='large' selectable textAlign="left">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Rank</Table.HeaderCell>
                    <Table.HeaderCell>Athlete
                        <span css={{color: '#55acee', marginLeft: 10}}>
                            ({leaderboard.length.toLocaleString()})
                        </span>
                    </Table.HeaderCell>
                    <Table.HeaderCell>Total Push-Ups
                        <span css={{color: '#55acee', marginLeft: 10}}>
                            ({totalPushUps.toLocaleString()})
                        </span>
                    </Table.HeaderCell>
                    <Table.HeaderCell>Catch the Leader</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {leaderboard.map(({id, name, count}, i) => {
                    const place = i + 1;
                    const maybePlaceText = place === 1 ? '' : place;
                    const diffFromLeader = leaderboard[0].count - count;
                    return (
                        <Table.Row key={id}>
                            <Table.Cell>
                                <MaybeRibbon place={place} />
                                {maybePlaceText}
                            </Table.Cell>
                            <Table.Cell>
                                {name}
                            </Table.Cell>
                            <Table.Cell>
                                {count}
                            </Table.Cell>
                            <Table.Cell>
                                {diffFromLeader > 0 ? `${diffFromLeader} more` : ''}
                            </Table.Cell>
                        </Table.Row>
                    )
                })}
            </Table.Body>

            <Table.Footer>
                <Table.Row>
                    <Table.HeaderCell colSpan='4'>
                        <Menu floated='right' pagination>
                            <Menu.Item as='a' icon>
                                <Icon name='chevron left' />
                            </Menu.Item>
                            <Menu.Item as='a'>1</Menu.Item>
                            <Menu.Item as='a'>2</Menu.Item>
                            <Menu.Item as='a'>3</Menu.Item>
                            <Menu.Item as='a'>4</Menu.Item>
                            <Menu.Item as='a' icon>
                                <Icon name='chevron right' />
                            </Menu.Item>
                        </Menu>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    )
};

const Home = ({leaderboard, totalPushUps}) => (
    <Layout>
        <Head>
            <title>Push-Up Heroes</title>
            <link rel='icon' href='/favicon.ico' />
            <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
        </Head>

        <Nav />

        <Container text css={{ marginTop: '8em' }}>
            <Header as='h1'>
                <span css={{color: '#303030'}}>Leaderboard</span>
            </Header>
            <Leaderboard leaderboard={leaderboard} totalPushUps={totalPushUps} />
        </Container>
    </Layout>
);

export default withData(props => {
    return (
        <Home />
    );
});
