import React from 'react';
import Link from 'next/link';
import { gql } from 'apollo-boost';
import withData from '../lib/apollo';
import {useQuery} from '@apollo/react-hooks';
import {Table, Image, Icon} from 'semantic-ui-react';
import { BLUE } from '../utils/constants';
import LoadingTableView from './LoadingTableView';

import { jsx } from '@emotion/core';
/** @jsx jsx */

const GET_GLOBAL_USERS_FEED = gql`
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

const linkCss = {
    display: 'block',
    cursor: 'pointer',
    color: 'initial',
};

function MaybeLink({rowspan, slackId, realName, children}) {
    if (rowspan === 1) {
        return (
            <Table.Cell rowSpan={rowspan}>
                <Link href='/users/[id]' as={`/users/${slackId}`}>
                    <a title={`${realName}'s page`} css={linkCss}>
                        {children}
                    </a>
                </Link>
            </Table.Cell>
        )
    }

    return (
        <Table.Cell css={{verticalAlign: 'top'}} rowSpan={rowspan}>
            {children}
        </Table.Cell>
    );
}

const GlobalFeed = ({totalPushUps, bestIndividualSetCount}) => {
    const { loading, error, data, fetchMore } = useQuery(GET_GLOBAL_USERS_FEED);

    return (
        <Table celled padded selectable size='large' striped textAlign="left">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell width={1}>Sets
                        {data && (
                            <span css={{color: BLUE, marginLeft: 6}}>
                                ({data.globalUsersFeed.feed.length.toLocaleString()})
                            </span>
                        )}
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

            {(loading || !data) ? <LoadingTableView /> : (
                <Table.Body>
                    {data.globalUsersFeed.feed.map(({slackId, dayOfWeek, date, time, count, simplifiedDate, profile}, i, arr) => {
                        const rowspan = data.globalUsersFeed.setsByDayMap[simplifiedDate];

                        const firstIndex = arr.findIndex(item => item.simplifiedDate === simplifiedDate);

                        const maybeSetsCell = rowspan > 1 && i > firstIndex ? null : (
                            <MaybeLink rowspan={rowspan} realName={profile.real_name} slackId={slackId}>
                                {rowspan}
                            </MaybeLink>
                        );

                        const maybeDayCell = rowspan > 1 && i > firstIndex ? null : (
                            <MaybeLink rowspan={rowspan} realName={profile.real_name} slackId={slackId}>
                                {dayOfWeek}
                            </MaybeLink>
                        );

                        const maybeDateCell = rowspan > 1 && i > firstIndex ? null : (
                            <MaybeLink rowspan={rowspan} realName={profile.real_name} slackId={slackId}>
                                {date}
                            </MaybeLink>
                        );

                        return (
                            <Table.Row key={i}>
                                {maybeSetsCell}
                                {maybeDayCell}
                                {maybeDateCell}
                                <Table.Cell>
                                    <Link href='/users/[id]' as={`/users/${slackId}`}>
                                        <a title={`${profile.real_name}'s page`} css={linkCss}>
                                            {time}
                                        </a>
                                    </Link>
                                </Table.Cell>
                                <Table.Cell>
                                    <Link href='/users/[id]' as={`/users/${slackId}`}>
                                        <a title={`${profile.real_name}'s page`} css={linkCss}>
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
                                    <Link href='/users/[id]' as={`/users/${slackId}`}>
                                        <a title={`${profile.real_name}'s page`} css={linkCss}>
                                            {count}
                                            {count === bestIndividualSetCount && (
                                                <span css={{
                                                    marginLeft: 10,
                                                }}>
                                                    <Icon color="yellow" name="star" />
                                                </span>
                                            )}
                                        </a>
                                    </Link>
                                </Table.Cell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            )}

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
