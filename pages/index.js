import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Label, Image, Table, Header, Tab, Menu } from 'semantic-ui-react';
import Crown from '../components/Crown';
const GlobalFeed = dynamic(() => import('../components/GlobalFeed'));
import Layout from '../components/Layout';
import Stats from '../components/Stats';
import withData from '../lib/apollo';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { RED, YELLOW } from '../utils/constants';

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
                dailyAvg
                contributionPercentage
                profile {
                    image_48
                    real_name
                }
            }
            totalPushUps
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
        }
        globalUsersFeed {
            feed {
                slackId
                profile {
                    image_48
                    real_name
                }
                count
                dayOfWeek
                date
                time
                simplifiedDate
            }
            setsByDayMap
        }
        mostRecentSet {
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
`;

const EmptyView = ({message}) => {
    return (
        <Table celled size='large' selectable textAlign="left">
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
                <Table.Row key="empty" textAlign="center">
                    <Table.Cell colSpan='6'>
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
                                    <Image src="/images/astronaut.svg" centered/>
                                </span>
                            </span>
                    </Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
    );
};

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

const Leaderboard = ({data, loading}) => {
    if (loading) return null;

    const {leaderboard} = data;
    const {rankings, totalAthletes} = leaderboard;

    if (totalAthletes === 0) {
        return <EmptyView message="No one has done any push-ups yet!" />
    }

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

const Home = () => {
    const { loading, error, data, fetchMore } = useQuery(GET_LEADERBOARD, {
        notifyOnNetworkStatusChange: true
    });

    const [activeTab, setActiveTab] = useState('leaderboard');

    const panes = [{
        menuItem: (
            <Menu.Item key='leaderboard'
                       active={activeTab === 'leaderboard'}
                       onClick={() => setActiveTab('leaderboard')}
                       style={{borderTop: activeTab === 'leaderboard' ? `.2em solid ${RED}` : undefined}}
            >
                <Header as='h2'>Leaderboard</Header>
            </Menu.Item>
        ),
        render: () => <Tab.Pane loading={loading}><Leaderboard data={data} loading={loading} /></Tab.Pane> }, {
        menuItem: (
            <Menu.Item key='feed'
                       active={activeTab === 'feed'}
                       onClick={() => setActiveTab('feed')}
                       style={{borderTop: activeTab === 'feed' ? `.2em solid ${YELLOW}` : undefined}}
            >
                <Header as='h2'>Feed</Header>
            </Menu.Item>
        ),
        render: () => <Tab.Pane loading={loading}>
            <GlobalFeed totalPushUps={data.leaderboard.totalPushUps}
                        bestIndividualSetCount={data.leaderboard.bestIndividualSet.count}
                        globalUsersFeed={data.globalUsersFeed}
            />
        </Tab.Pane>
    }];

    return (
        <Layout>
            <Stats data={data} loading={loading} />
            <Tab panes={panes} />
        </Layout>
    )
};

export default withData(props => <Home />);
