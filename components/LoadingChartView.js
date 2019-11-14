import React from 'react';
import { Dimmer, Header, Loader, Segment } from 'semantic-ui-react';
import { jsx } from '@emotion/core';
/** @jsx jsx */

const LoadingChartView = () => {
    return (
        <>
            <Header as='h2'
                    attached='top'
                    style={{
                        backgroundColor: '#f9fafb',
                        paddingBottom: 20,
                        paddingTop: 20,
                    }}
                    textAlign="center">
                Push-Ups Over Time
            </Header>
            <Segment attached='bottom' padded="very" style={{
                paddingLeft: 0,
                paddingRight: 0,
            }}>
                <div css={{
                    height: 190,
                }}>
                    <Dimmer active inverted >
                        <Loader size='massive'>
                            Loading
                        </Loader>
                    </Dimmer>
                </div>
            </Segment>
        </>
    );
};

export default LoadingChartView;
