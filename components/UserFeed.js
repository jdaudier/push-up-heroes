import React from 'react';
import { Table } from 'semantic-ui-react';

/** @jsx jsx */
import { jsx, keyframes } from '@emotion/core';

const UserFeed = ({data}) => {
    return (
        <Table celled color="yellow" padded size='large' striped textAlign="left">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>Day</Table.HeaderCell>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Time</Table.HeaderCell>
                    <Table.HeaderCell>Count</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {data.map(({dayOfWeek, date, time, count}, i) => {
                    return (
                        <Table.Row key={i}>
                            <Table.Cell>
                                {dayOfWeek}
                            </Table.Cell>
                            <Table.Cell>
                                {date}
                            </Table.Cell>
                            <Table.Cell>
                                {time}
                            </Table.Cell>
                            <Table.Cell>
                                {count}
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
