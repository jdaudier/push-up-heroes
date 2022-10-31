import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, gql } from '@apollo/client';
import format from "date-fns/format";
import { Table, Image, Icon, Popup } from 'semantic-ui-react';
import { BLUE, FEED_LIMIT } from '../utils/constants';
import LoadingTableView from './LoadingTableView';
import FeedPagination from './FeedPagination';

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

const GET_GLOBAL_USERS_FEED = gql`
    query globalUsersFeed($page: Int!) {
        globalUsersFeed(page: $page) {
            created,
            id,
            count,
            name,
            profile {
                real_name,
                image_48,
            }
        }
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
                <Link href='/users/[id]' as={`/users/${slackId}`} legacyBehavior>
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
                <Link href='/users/[id]' as={`/users/${slackId}`} legacyBehavior>
                    <a title={`${realName}'s page`} css={linkCss}>
                        {children}
                    </a>
                </Link>
            </div>
        </Table.Cell>
    );
}

const formatDataForGlobalFeed = data => {
    if (!data) return;

    return data.globalUsersFeed.reduce((acc, data) => {
        const createdDate = new Date(data.created);

        const dayOfWeek = format(createdDate, 'E');
        const date = format(createdDate, 'MMM d, y');
        const time = format(createdDate, 'h:mm aaaa');
        const simplifiedDate = format(createdDate, 'yyyy-MM-dd');

        return {
            feed:[...acc.feed, {
                ...data,
                slackId: data.id,
                dayOfWeek,
                date,
                time,
                simplifiedDate,
            }],
            setsByDayMap: {
                ...acc.setsByDayMap,
                [simplifiedDate]: acc.setsByDayMap[simplifiedDate] ? acc.setsByDayMap[simplifiedDate] + 1 : 1,
            }
        }
    }, {
        feed: [],
        setsByDayMap: {}
    });
}

const GlobalFeed = ({totalSets, totalPushUps, bestIndividualSetCount}) => {
    const [activePage, setActivePage] = useState(1);
    const { loading, error, data } = useQuery(GET_GLOBAL_USERS_FEED, {
        variables: { page: activePage },
    });
    
    const formattedData = formatDataForGlobalFeed(data);

    const totalPages = Math.ceil(totalSets / FEED_LIMIT);

    return (
        <>
            <Table celled padded selectable size='large' striped textAlign="left">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell className="mobile-hidden" width={1}>Sets
                            <span css={{color: BLUE, marginLeft: 6}}>
                                ({totalSets.toLocaleString()})
                            </span>
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Day
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Date
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                            Time
                        </Table.HeaderCell>
                        <Table.HeaderCell>Athlete</Table.HeaderCell>
                        <Table.HeaderCell width={2}>Count
                            <span css={{color: BLUE, marginLeft: 6}}>
                                ({totalPushUps.toLocaleString()})
                            </span>
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                {!data ? <LoadingTableView /> : (
                    <Table.Body>
                        {formattedData.feed.map(({slackId, dayOfWeek, date, time, count, simplifiedDate, profile}, i, arr) => {
                            const rowSpan = formattedData.setsByDayMap[simplifiedDate];

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
                                        <Link href='/users/[id]' as={`/users/${slackId}`} legacyBehavior>
                                            <a title={`${profile.real_name}'s page`} css={linkCss}>
                                                {time}
                                            </a>
                                        </Link>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Link href='/users/[id]' as={`/users/${slackId}`} legacyBehavior>
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
                                        <Link href='/users/[id]' as={`/users/${slackId}`} legacyBehavior>
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
                                '@media(max-width: 767px)': {
                                    flexDirection: 'column',
                                    justifyContent: 'normal',
                                }
                            }}>
                                <div css={{
                                    color: 'rgba(0,0,0,.6)',
                                    '@media(max-width: 767px)': {
                                        textAlign: 'center',
                                        lineHeight: 1.6,
                                    }
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
                                    in <Icon aria-label="Slack" name="slack" size="large" />to log sets and
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
                                    <div css={{
                                        marginLeft: 'auto',
                                        '@media(max-width: 767px)': {
                                            marginLeft: 'unset',
                                            marginTop: 30
                                        }
                                    }}>
                                        <FeedPagination
                                            activePage={activePage}
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
        </>
    )
};

export default GlobalFeed;
