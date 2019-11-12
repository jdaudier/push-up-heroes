import React from 'react';
import { Table, Icon } from 'semantic-ui-react';
import { BLUE } from '../utils/constants';

/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';

const UserFeed = ({feed, setsByDayMap, totalPushUps, bestSetCount}) => {
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
                    <Table.HeaderCell width={2}>Count
                        <span css={{color: BLUE, marginLeft: 6}}>
                            ({totalPushUps.toLocaleString()})
                        </span>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {feed.map(({dayOfWeek, date, time, count, simplifiedDate}, i, arr) => {
                    const rowSpan = setsByDayMap[simplifiedDate];
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
                        <Table.Cell css={{
                            verticalAlign: rowSpan > 1 ? 'top' : 'inherit',
                        }}
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

            <Table.Footer>
                <Table.Row>
                    <Table.HeaderCell colSpan='6'>
                        <div css={{
                            color: 'rgba(0,0,0,.6)',
                            textAlign: 'right',
                            marginTop: 6,
                            marginBottom: 6,
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
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>
    )
};

export default UserFeed;
