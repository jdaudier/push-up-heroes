import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { Table, Icon } from 'semantic-ui-react';
import { BLUE, FEED_LIMIT } from '../utils/constants';
import FeedPagination from "./FeedPagination";
import LoadingTableView from "./LoadingTableView";

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

const GET_USER_FEED = gql`
    query userFeed($id: ID! $page: Int!) {
        userFeed(id: $id page: $page) {
            feed {
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

const UserFeed = ({id, totalSets, totalPushUps, bestSetCount}) => {
    const [activePage, setActivePage] = useState(1);
    const { loading, error, data } = useQuery(GET_USER_FEED, {
        variables: {
            id,
            page: activePage
        },
    });

    const totalPages = Math.ceil(totalSets / FEED_LIMIT);

    return (
        <Table celled color="yellow" padded size='large' striped textAlign="left" css={{position: 'relative'}}>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell className="mobile-hidden" width={1}>Sets
                        <span css={{color: BLUE, marginLeft: 6}}>
                            ({totalSets.toLocaleString()})
                        </span>
                    </Table.HeaderCell>
                    <Table.HeaderCell>Day</Table.HeaderCell>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Time</Table.HeaderCell>
                    <Table.HeaderCell width={2}>Count
                        <span css={{color: BLUE, marginLeft: 6}}>
                            ({totalPushUps.toLocaleString()})
                        </span>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            {!data ? <LoadingTableView colSpan={5} /> : (
                <Table.Body>
                    {data.userFeed.feed.map(({dayOfWeek, date, time, count, simplifiedDate}, i, arr) => {
                        const rowSpan = data.userFeed.setsByDayMap[simplifiedDate];
                        const firstIndex = arr.findIndex(item => item.simplifiedDate === simplifiedDate);

                        const shouldCellBeHidden = rowSpan > 1 && i > firstIndex;

                        const cellCss = {
                            display: shouldCellBeHidden ? 'none' : 'table-cell',
                            verticalAlign: rowSpan > 1 ? 'top' : 'inherit',
                            '@media(max-width: 767px)': {
                                display: 'inherit',
                                verticalAlign: 'inherit',
                            }
                        };

                        const maybeSetsCell = shouldCellBeHidden ? null : (
                            <Table.Cell
                                className="mobile-hidden"
                                css={{verticalAlign: rowSpan > 1 ? 'top' : 'inherit'}}
                                rowSpan={rowSpan}>
                                {rowSpan}
                            </Table.Cell>
                        );

                        const maybeDayCell = (
                            <Table.Cell css={cellCss}
                                        rowSpan={rowSpan}>
                                {dayOfWeek}
                            </Table.Cell>
                        );

                        const maybeDateCell = (
                            <Table.Cell css={cellCss}
                                        rowSpan={rowSpan}>
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
                                    {count}
                                    {count === bestSetCount && (
                                        <span css={{
                                            marginLeft: 10,
                                        }}>
                                        <Icon color="yellow" name="star" />
                                    </span>
                                    )}
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
                                View your own stats in Slack by typing
                                <code css={{
                                    backgroundColor: 'rgba(27,31,35,.05)',
                                    borderRadius: 3,
                                    fontSize: '95%',
                                    padding: '.2em .4em',
                                    marginLeft: 4,
                                }}>/mystats</code>
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
                                        disabled={!data}
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

export default UserFeed;
