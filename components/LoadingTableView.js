import React from 'react';
import { Dimmer, Loader, Table } from 'semantic-ui-react';
import { jsx } from '@emotion/core';
/** @jsx jsx */

const LoadingTableView = () => {
    return (
        <Table.Body>
            <Table.Row>
                <Table.Cell colSpan={6}>
                    <Dimmer active inverted >
                        <Loader size='massive'>
                            Loading
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
        </Table.Body>
    );
};

export default LoadingTableView;
