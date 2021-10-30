import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { gql } from "@apollo/client";
import client from "../apollo-client";
import ClientOnly from '../components/ClientOnly';
import { Label, Image, Table, Header, Tab, Menu } from 'semantic-ui-react';
import Crown from '../components/Crown';
const GlobalFeed = dynamic(() => import('../components/GlobalFeed'));
const GlobalChart = dynamic(() => import('../components/GlobalChart'));
import Layout from '../components/Layout';
import Stats from '../components/Stats';
import { BLUE, RED, YELLOW } from '../utils/constants';
import EmptyView from "../components/EmptyView";

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

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

const GET_LEADERBOARD = gql`
    query leaderboard {
        leaderboard {
            rankings {
                id
                name
                count
                dailyAvg
                contributionPercentage
                profile {
                    image_48
                    real_name
                }
            }
            totalPushUps
            totalSets
            totalAthletes
            avgSet
            dailyAvg
            bestIndividualSet {
                count
                athletes {
                    id
                    name
                    count
                    created
                    profile {
                        image_48
                        real_name
                    }
                }
            }
            bestDailyTotalOverall {
                profiles {
                    id
                    image_48
                    real_name
                    date
                }
                count
            }
        }
    }
`;

const cellLinkCss = {
    display: 'block',
    cursor: 'pointer',
    color: 'initial',
    position: 'relative',
};

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

const medalLinkCss = {
    ...cellLinkCss,
    height: 19,
    '@media(max-width: 767px)': {
        height: 'unset',
    }
};

const medalCss = {
    position: 'absolute',
    top: '50%',
    left: -7,
    transform: 'translateY(-50%)',
    '@media(max-width: 767px)': {
        position: 'relative',
        transform: 'unset',
    }
};

const tabCss = {
    display: 'inline-block',
    fontSize: '1.71428571rem',
    '@media(max-width: 767px)': {
        fontSize: 'calc(1.15rem + .6vw)'
    }
};

const Leaderboard = ({leaderboard: {rankings}}) => {
    return (
        <Table celled padded size='large' selectable striped textAlign="left">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Rank</Table.HeaderCell>
                    <Table.HeaderCell>Athlete</Table.HeaderCell>
                    <Table.HeaderCell>Total Push-Ups</Table.HeaderCell>
                    <Table.HeaderCell>Catch the Leader</Table.HeaderCell>
                    <Table.HeaderCell>Daily Average</Table.HeaderCell>
                    <Table.HeaderCell>Contribution</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {rankings.map(({id, name, count, dailyAvg, contributionPercentage, profile}, i) => {
                    const place = i + 1;
                    const maybePlaceText = [1, 2, 3].includes(place) ? '' : place;
                    const diffFromLeader = rankings[0].count - count;
                    return (
                        <Table.Row key={id}>
                            <Table.Cell>
                                <Link href='/users/[id]' as={`/users/${id}`}>
                                    <a title={`${profile.real_name}'s page`} css={cellLinkCss}>
                                        <MaybeRibbon place={place} />
                                        {maybePlaceText}
                                    </a>
                                </Link>
                            </Table.Cell>
                            <Table.Cell>
                                <Link href='/users/[id]' as={`/users/${id}`}>
                                    <a title={`${profile.real_name}'s page`} css={cellLinkCss}>
                                        {place === 1 && (<div css={crownCss}>
                                            <Crown />
                                        </div>)}
                                        <Image src={profile.image_48} avatar />
                                        <span css={{
                                            display: 'inline-block',
                                            verticalAlign: 'middle',
                                            marginLeft: 5,
                                        }}>
                                            {profile.real_name}
                                        </span>
                                    </a>
                                </Link>
                            </Table.Cell>
                            <Table.Cell>
                                <Link href='/users/[id]' as={`/users/${id}`}>
                                    <a title={`${profile.real_name}'s page`} css={cellLinkCss}>
                                        {count}
                                    </a>
                                </Link>
                            </Table.Cell>
                            <Table.Cell>
                                <Link href='/users/[id]' as={`/users/${id}`}>
                                    <a title={`${profile.real_name}'s page`} css={medalLinkCss}>
                                        {diffFromLeader > 0 ? `${diffFromLeader} more` : (
                                            <div css={medalCss}>
                                                <Image src="/images/medal.png" style={{height: 50}} />
                                            </div>
                                        )}
                                    </a>
                                </Link>
                            </Table.Cell>
                            <Table.Cell>
                                <Link href='/users/[id]' as={`/users/${id}`}>
                                    <a title={`${profile.real_name}'s page`} css={cellLinkCss}>
                                        {dailyAvg}
                                    </a>
                                </Link>
                            </Table.Cell>
                            <Table.Cell>
                                <Link href='/users/[id]' as={`/users/${id}`}>
                                    <a title={`${profile.real_name}'s page`} css={cellLinkCss}>
                                        {contributionPercentage}%
                                    </a>
                                </Link>
                            </Table.Cell>
                        </Table.Row>
                    )
                })}
            </Table.Body>

            <Table.Footer>
                <Table.Row>
                    <Table.HeaderCell colSpan='6'>
                        <div css={{
                            color: 'rgba(0,0,0,.6)',
                            textAlign: 'right',
                            marginTop: 6,
                            marginBottom: 6,
                        }}>
                            View this in Slack by typing
                            <code css={{
                                backgroundColor: 'rgba(27,31,35,.05)',
                                borderRadius: 3,
                                fontSize: '95%',
                                padding: '.2em .4em',
                                marginLeft: 4,
                            }}>/leaderboard</code>
                        </div>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    )
};

export async function getServerSideProps() {
    const { data } = await client.query({
        query: GET_LEADERBOARD
    });

    return {
        props: { data },
    };
}

const Home = ({ data }) => {
    const totalPushUps = data.leaderboard.totalPushUps;

    if (totalPushUps === 0) {
        return <EmptyView />
    }

    const [activeTab, setActiveTab] = useState('leaderboard');

    const leaderboardPane = {
        menuItem: (
            <Menu.Item key='leaderboard'
                       active={activeTab === 'leaderboard'}
                       onClick={() => setActiveTab('leaderboard')}
                       style={{borderTop: activeTab === 'leaderboard' ? `.2em solid ${RED}` : undefined}}
            >
                <Header as='h2'>
                    <span css={tabCss}>
                        Leaderboard
                    </span>
                </Header>
            </Menu.Item>
        ),
        render: () => (
            <Tab.Pane loading={!data}>
                <Leaderboard leaderboard={data ? data.leaderboard : {rankings: []}} />
            </Tab.Pane>
        )
    };

    const feedPane = data ? {
        menuItem: (
            <Menu.Item key='feed'
                       active={activeTab === 'feed'}
                       onClick={() => setActiveTab('feed')}
                       style={{borderTop: activeTab === 'feed' ? `.2em solid ${YELLOW}` : undefined}}
            >
                <Header as='h2'>
                    <span css={tabCss}>
                        Feed
                    </span>
                </Header>
            </Menu.Item>
        ),
        render: () => (
            <ClientOnly>
                <Tab.Pane>
                    <GlobalFeed bestIndividualSetCount={data.leaderboard.bestIndividualSet.count}
                                totalPushUps={data.leaderboard.totalPushUps}
                                totalSets={data.leaderboard.totalSets}
                    />
                </Tab.Pane>
            </ClientOnly>
        )
    } : null;

    const chartPane = data ? {
        menuItem: (
            <Menu.Item key='chart'
                       active={activeTab === 'chart'}
                       onClick={() => setActiveTab('chart')}
                       style={{borderTop: activeTab === 'chart' ? `.2em solid ${BLUE}` : undefined}}
            >
                <Header as='h2'>
                    <span css={tabCss}>
                        Chart
                    </span>
                </Header>
            </Menu.Item>
        ),
        render: () => (
            <ClientOnly>
                <Tab.Pane>
                    <GlobalChart dailyAvg={data.leaderboard.dailyAvg} />
                </Tab.Pane>
            </ClientOnly>
        )
    } : null;

    const panes = [leaderboardPane, feedPane, chartPane];

    return (
        <Layout>
            <Stats data={data} />
            <Tab panes={panes} />
        </Layout>
    )
};

export default Home;
