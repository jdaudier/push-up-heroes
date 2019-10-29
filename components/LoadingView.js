import { Dimmer, Loader, Grid } from 'semantic-ui-react';
import Layout from './Layout';
import { jsx } from '@emotion/core';
/** @jsx jsx */

const statsBoxCss = {
    backgroundColor: '#bcbec0',
    borderRadius: 4,
    height: 115,
    padding: 20,
    boxShadow: '0 1px 3px 0 #d4d4d5, 0 0 0 1px #d4d4d5'
};

const Stat = () => {
    return <div css={statsBoxCss} />
};

const LoadingView = () => {
    return (
        <Layout>
            <Dimmer active inverted page>
                <Loader size='massive'>
                    <div css={{
                        marginTop: 10
                    }}>
                        Loading
                    </div>
                </Loader>
            </Dimmer>
            <Grid doubling columns={3} stackable>
                <Grid.Column>
                    <Stat />
                </Grid.Column>
                <Grid.Column>
                    <Stat />
                </Grid.Column>
                <Grid.Column>
                    <Stat />
                </Grid.Column>
                <Grid.Column>
                    <Stat />
                </Grid.Column>
                <Grid.Column>
                    <Stat />
                </Grid.Column>
                <Grid.Column>
                    <Stat />
                </Grid.Column>
            </Grid>
        </Layout>
    );
};

export default LoadingView;
