import React from 'react';
import { Dimmer, Header, Loader, Segment } from 'semantic-ui-react';
import {FIRST_CHART_HEADING} from "./LeaderboardChart/LeaderboardChart";

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

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
                {FIRST_CHART_HEADING}
            </Header>
            <Segment attached='bottom' padded="very" style={{
                paddingLeft: 0,
                paddingRight: 0,
            }}>
                <div css={{
                    height: 190,
                }}>
                    <Dimmer active inverted>
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
