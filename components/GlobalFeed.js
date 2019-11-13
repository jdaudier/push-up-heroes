import React, { useState } from 'react';
import Link from 'next/link';
import { gql } from 'apollo-boost';
import withData from '../lib/apollo';
import { useQuery } from '@apollo/react-hooks';
import { Table, Image, Icon } from 'semantic-ui-react';
import {BLUE, FEED_LIMIT } from '../utils/constants';
import LoadingTableView from './LoadingTableView';
import FeedPagination from './FeedPagination';

import { jsx } from '@emotion/core';
/** @jsx jsx */

const GET_GLOBAL_USERS_FEED = gql`
    query globalUsersFeed($page: Int!) {
        globalUsersFeed(page: $page) {
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

const GET_TOTAL_SET_COUNT = gql`
    query totalSetCount {
        totalSetCount
    }
`;

const linkCss = {
    display: 'block',
    cursor: 'pointer',
    color: 'initial',
};

function MaybeLink({className, rowSpan, shouldCellBeHidden, slackId, realName, children}) {
    const cellCss = {
        display: shouldCellBeHidden ? 'none' : 'table-cell',
        verticalAlign: rowSpan > 1 ? 'top' : 'inherit',
        '@media(max-width: 767px)': {
            display: 'inherit',
            verticalAlign: 'inherit',
        }
    };

    const mobileCss = {
        '@media(max-width: 767px)': {
            display: 'none',
        }
    };

    const desktopCss = {
        '@media(min-width: 768px)': {
            display: 'none',
        }
    };

    if (rowSpan === 1) {
        return (
            <Table.Cell className={className}>
                <Link href='/users/[id]' as={`/users/${slackId}`}>
                    <a title={`${realName}'s page`} css={linkCss}>
                        {children}
                    </a>
                </Link>
            </Table.Cell>
        )
    }

    return (
        <Table.Cell className={className} css={cellCss} rowSpan={rowSpan}>
            <div css={mobileCss}>
                {children}
            </div>
            <div css={desktopCss}>
                <Link href='/users/[id]' as={`/users/${slackId}`}>
                    <a title={`${realName}'s page`} css={linkCss}>
                        {children}
                    </a>
                </Link>
            </div>
        </Table.Cell>
    );
}

const GlobalFeed = ({totalPushUps, bestIndividualSetCount}) => {
    const [activePage, setActivePage] = useState(1);
    const { loading, error, data } = useQuery(GET_GLOBAL_USERS_FEED, {
        variables: { page: activePage },
    });

    const { loading: setCountLoading, data: setCountData } = useQuery(GET_TOTAL_SET_COUNT);

    const totalPages = setCountData ? Math.ceil(setCountData.totalSetCount / FEED_LIMIT) : 1;

    return (
        <Table celled padded selectable size='large' striped textAlign="left">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell className="mobile-hidden" width={1}>Sets
                        {setCountData && (
                            <span css={{color: BLUE, marginLeft: 6}}>
                                ({setCountData.totalSetCount.toLocaleString()})
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
                        const rowSpan = data.globalUsersFeed.setsByDayMap[simplifiedDate];

                        const firstIndex = arr.findIndex(item => item.simplifiedDate === simplifiedDate);

                        const shouldCellBeHidden = rowSpan > 1 && i > firstIndex;

                        const maybeSetsCell = shouldCellBeHidden ? null : (
                            <MaybeLink className="mobile-hidden"
                                       realName={profile.real_name}
                                       rowSpan={rowSpan}
                                       slackId={slackId}>
                                {rowSpan}
                            </MaybeLink>
                        );

                        const maybeDayCell = (
                            <MaybeLink rowSpan={rowSpan}
                                       realName={profile.real_name}
                                       shouldCellBeHidden={shouldCellBeHidden}
                                       slackId={slackId}>
                                {dayOfWeek}
                            </MaybeLink>
                        );

                        const maybeDateCell = (
                            <MaybeLink rowSpan={rowSpan}
                                       realName={profile.real_name}
                                       shouldCellBeHidden={shouldCellBeHidden}
                                       slackId={slackId}>
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
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: totalPages > 1 ? 'normal': 'flex-end',
                        }}>
                            <div css={{
                                color: 'rgba(0,0,0,.6)',
                            }}>
                                Use
                                <code css={{
                                    backgroundColor: 'rgba(27,31,35,.05)',
                                    borderRadius: 3,
                                    fontSize: '95%',
                                    padding: '.2em .4em',
                                    marginLeft: 4,
                                    marginRight: 4,
                                }}>/pushups
                                </code>
                                in Slack to log sets and
                                <code css={{
                                    backgroundColor: 'rgba(27,31,35,.05)',
                                    borderRadius: 3,
                                    fontSize: '95%',
                                    padding: '.2em .4em',
                                    marginLeft: 4,
                                    marginRight: 4,
                                }}>/challenge
                                </code>
                                to challenge someone
                            </div>
                            {totalPages > 1 && (
                                <div css={{marginLeft: 'auto'}}>
                                    <FeedPagination
                                        activePage={activePage}
                                        disabled={setCountLoading || !setCountData}
                                        onPageChange={(e, {activePage}) => {
                                            setActivePage(activePage);
                                        }}
                                        totalPages={totalPages}
                                    />
                                </div>
                            )}
                        </div>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    )
};

export default withData(props => <GlobalFeed {...props} />);
