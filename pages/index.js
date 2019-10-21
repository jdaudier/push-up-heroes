import React from 'react';
import Link from 'next/link'
import Crown from '../components/Crown';
import { Icon, Label, Image, Menu, Table, Header } from 'semantic-ui-react';
import Layout from '../components/Layout';
import withData from "../lib/apollo";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';

const MaybeRibbon = ({place}) => {
    switch (place) {
        case 1:
            return <Label color="yellow" ribbon size="big">1st</Label>;
        case 2:
            return <Label color="blue" ribbon size="big">2nd</Label>;
        case 3:
            return <Label color="red" ribbon size="big">3rd</Label>;
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
            rankings {
                id 
                name 
                count
                profile {
                    image_48
                    real_name_normalized
                }
            }
            totalPushUps
            totalAthletes
            avgSet
            bestIndividualSet {
                id
                name
                count
                profile {
                    image_48
                    real_name_normalized
                }
            }
        }
        mostRecentSet {
            id
            name
            count
            profile {
                image_48
                real_name_normalized
            }
        }
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
                        <Table.Cell colSpan='5'>
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

const cellLinkCss = {
    display: 'block',
    cursor: 'pointer',
    color: 'initial',
    position: 'relative',
};

const Leaderboard = () => {
    const { loading, error, data, fetchMore } = useQuery(GET_LEADERBOARD, {
        notifyOnNetworkStatusChange: true
    });

    if (!data) return null;

    const {mostRecentSet, leaderboard} = data;
    const {rankings, totalPushUps, totalAthletes, avgSet, bestIndividualSet} = leaderboard;

    if (totalAthletes === 0) {
        return <EmptyView message="No one has done any push-ups yet!" />
    }

    const crownCss = {
        left: -12,
        top: -26,
        position: 'absolute',
        width: 50,
        transform: 'rotate(-10deg)',
        '@media(max-width: 767px)': {
            top: 11,
            position: 'relative',
        }
    };

    return (
        <Table celled size='large' selectable textAlign="left">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Rank</Table.HeaderCell>
                    <Table.HeaderCell>Athlete</Table.HeaderCell>
                    <Table.HeaderCell>Total Push-Ups</Table.HeaderCell>
                    <Table.HeaderCell>Catch the Leader</Table.HeaderCell>
                    <Table.HeaderCell>Contribution</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {rankings.map(({id, name, count, profile}, i) => {
                    const place = i + 1;
                    const maybePlaceText = [1, 2, 3].includes(place) ? '' : place;
                    const diffFromLeader = rankings[0].count - count;
                    const lowercaseId = id.toLowerCase();
                    return (
                        <Table.Row key={id}>
                            <Table.Cell>
                                <Link href='/users/[id]' as={`/users/${lowercaseId}`}>
                                    <a title="rank" css={cellLinkCss}>
                                        <MaybeRibbon place={place} />
                                        {maybePlaceText}
                                    </a>
                                </Link>
                            </Table.Cell>
                            <Table.Cell>
                                <Link href='/users/[id]' as={`/users/${lowercaseId}`}>
                                    <a title="athlete" css={cellLinkCss}>
                                        {place === 1 && (<div css={crownCss}>
                                            <Crown />
                                        </div>)}
                                        <Image src={profile.image_48} avatar />
                                        <span css={{
                                            display: 'inline-block',
                                            verticalAlign: 'middle',
                                            marginLeft: 5,
                                        }}>
                                            {profile.real_name_normalized}
                                        </span>
                                    </a>
                                </Link>
                            </Table.Cell>
                            <Table.Cell>
                                <Link href='/users/[id]' as={`/users/${lowercaseId}`}>
                                    <a title="count" css={cellLinkCss}>
                                        {count}
                                    </a>
                                </Link>
                            </Table.Cell>
                            <Table.Cell>
                                <Link href='/users/[id]' as={`/users/${lowercaseId}`}>
                                    <a title="diff from leader" css={cellLinkCss}>
                                        {diffFromLeader > 0 ? `${diffFromLeader} more` : ''}
                                    </a>
                                </Link>
                            </Table.Cell>
                            <Table.Cell>
                                <Link href='/users/[id]' as={`/users/${lowercaseId}`}>
                                    <a title="contribution" css={cellLinkCss}>
                                        {Math.round((count / totalPushUps) * 100)}%
                                    </a>
                                </Link>
                            </Table.Cell>
                        </Table.Row>
                    )
                })}
            </Table.Body>

            <Table.Footer>
                <Table.Row>
                    <Table.HeaderCell colSpan='5'>
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

const Home = () => (
    <Layout>
        <Header as='h1'>
            <span css={{color: '#303030'}}>Leaderboard</span>
        </Header>
        <Leaderboard />
    </Layout>
);

export default withData(props => {
    return (
        <Home />
    );
});
