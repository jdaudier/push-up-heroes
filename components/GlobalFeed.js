import React from 'react';
import {Table, Icon, Image} from 'semantic-ui-react';
import { BLUE } from '../utils/constants';
import Clap from './Clap';
import withData from '../lib/apollo';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';

/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';
import Crown from "./Crown";
import Link from "next/link";

const GET_GLOBAL_FEED = gql`
    query globalUsersFeed {
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
    }
`;

const GlobalFeed = ({totalPushUps, bestIndividualSetCount}) => {
    const { loading, error, data, fetchMore } = useQuery(GET_GLOBAL_FEED, {
        notifyOnNetworkStatusChange: true
    });

    if (!data) return null;

    const {feed, setsByDayMap} = data.globalUsersFeed;

    return (
        <Table celled color="yellow" padded size='large' striped textAlign="left">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell width={1}>Sets
                        <span css={{color: BLUE, marginLeft: 6}}>
                            ({feed.length.toLocaleString()})
                        </span>
                    </Table.HeaderCell>
                    <Table.HeaderCell>Day</Table.HeaderCell>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Time</Table.HeaderCell>
                    <Table.HeaderCell>Athlete</Table.HeaderCell>
                    <Table.HeaderCell width={2}>Count
                        <span css={{color: BLUE, marginLeft: 6}}>
                            ({totalPushUps.toLocaleString()})
                        </span>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {feed.map(({slackId, dayOfWeek, date, time, count, simplifiedDate, profile}, i, arr) => {
                    const rowspan = setsByDayMap[simplifiedDate];

                    const firstIndex = arr.findIndex(item => item.simplifiedDate === simplifiedDate);

                    const maybeSetsCell = rowspan > 1 && i > firstIndex ? null : (
                        <Table.Cell rowSpan={rowspan}>
                            {rowspan}
                        </Table.Cell>
                    );

                    const maybeDayCell = rowspan > 1 && i > firstIndex ? null : (
                        <Table.Cell rowSpan={rowspan}>
                            {dayOfWeek}
                        </Table.Cell>
                    );

                    const maybeDateCell = rowspan > 1 && i > firstIndex ? null : (
                        <Table.Cell rowSpan={rowspan}>
                            {date}
                        </Table.Cell>
                    );

                    return (
                        <Table.Row key={i}>
                            {maybeSetsCell}
                            {maybeDayCell}
                            {maybeDateCell}
                            <Table.Cell>
                                {time}
                            </Table.Cell>
                            <Table.Cell>
                                <Link href='/users/[id]' as={`/users/${slackId}`}>
                                    <a title={`${profile.real_name}'s page`} css={{
                                        display: 'block',
                                        cursor: 'pointer',
                                        color: 'initial',
                                    }}>
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
                                <div css={{position: 'relative'}}>
                                    {count}
                                    {count === bestIndividualSetCount && (
                                        <span css={{
                                            marginLeft: 10,
                                            position: 'absolute',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 30,
                                        }}>
                                            <Clap />
                                        </span>
                                    )}
                                </div>
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
                            Log your sets in Slack by typing
                            <code css={{
                                backgroundColor: 'rgba(27,31,35,.05)',
                                borderRadius: 3,
                                fontSize: '95%',
                                padding: '.2em .4em',
                                marginLeft: 4,
                            }}>/pushups</code>
                        </div>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    )
};

export default withData(props => <GlobalFeed {...props} />);
