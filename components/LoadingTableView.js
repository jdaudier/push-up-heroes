import React from 'react';
import { Dimmer, Loader, Table } from 'semantic-ui-react';
import quote from '../utils/randomQuotes';
import { jsx } from '@emotion/core';
/** @jsx jsx */

const LoadingTableView = () => {
    return (
        <Table.Body>
            <Table.Row>
                <Table.Cell colSpan={6}>
                    <Dimmer active inverted >
                        <Loader size='massive'>
                            <blockquote css={{
                                fontStyle: 'italic',
                                lineHeight: 1.4,
                                marginBottom: '.5em',
                                marginTop: '.4em'
                            }}>
                                &ldquo;{quote.text}&rdquo;
                            </blockquote>
                            <small css={{
                                color: 'rgba(0, 0, 0, .4)',
                            }}>&ndash; {quote.author}</small>
                        </Loader>
                    </Dimmer>
                </Table.Cell>
            </Table.Row>
            <Table.Row>
                <Table.Cell colSpan={6} />
            </Table.Row>
            <Table.Row>
                <Table.Cell colSpan={6} />
            </Table.Row>
            <Table.Row>
                <Table.Cell colSpan={6} />
            </Table.Row>
            <Table.Row>
                <Table.Cell colSpan={6} />
            </Table.Row>
            <Table.Row>
                <Table.Cell colSpan={6} />
            </Table.Row>
            <Table.Row>
                <Table.Cell colSpan={6} />
            </Table.Row>
            <Table.Row>
                <Table.Cell colSpan={6} />
            </Table.Row>
        </Table.Body>
    );
};

export default LoadingTableView;
