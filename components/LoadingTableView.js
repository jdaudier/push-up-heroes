import React from 'react';
import { Dimmer, Loader, Table } from 'semantic-ui-react';

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

const LoadingTableView = ({colSpan} = {colSpan: 6}) => {
    return (
        <Table.Body>
            <Table.Row>
                <Table.Cell colSpan={colSpan}>
                    <Dimmer active inverted>
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
