import { Dimmer, Loader, Grid, Card, Image, Icon } from 'semantic-ui-react';
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

const cardWrapperCss = {
    display: 'block',
    '@media(max-width: 767px)': {
        display: 'flex',
        justifyContent: 'center',
    }
};

const mockUser = {
    real_name: 'Dwayne Johnson',
    title: 'Kicking Your Ass at Push-Ups',
    image_512: '/images/the-rock.jpg'
};

const UserCard = ({user: {real_name, title, image_512}}) => (
    <div css={cardWrapperCss}>
        <Card color='blue'>
            <Image src={image_512} wrapped ui={false} />
            <Card.Content>
                <Card.Header>{real_name}</Card.Header>
                <Card.Description>
                    {title}
                </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <Icon name='feed' />
                55 push-ups about 2 min ago
            </Card.Content>
        </Card>
    </div>
);

const UserStats = () => (
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
);

const LoadingUserView = () => {
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
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width={5}>
                        <UserCard user={mockUser} />
                    </Grid.Column>
                    <Grid.Column width={11}>
                        <UserStats />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Layout>
    );
};

export default LoadingUserView;
