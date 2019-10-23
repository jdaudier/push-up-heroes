import { useRouter } from 'next/router';
import withData from '../../lib/apollo';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Layout from '../../components/Layout';
import {Grid, Card, Image, Icon, Header} from 'semantic-ui-react'
import UserStats from '../../components/UserStats';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import parseISO from 'date-fns/parseISO';

/** @jsx jsx */
import { jsx } from '@emotion/core';

const GET_USER_STATS = gql`
    query getUserStats($id: ID!) {
        userSlackProfile(id: $id) {
            real_name_normalized
            title
            image_512
        }
        dailySetsByUser(id: $id) {
            name
            value
        }
        userStats(id: $id) {
            totalPushUps
            ranking
            dailyAvg
            avgSet
            catchTheLeader
            contributionPercentage
            bestSet {
                count
                created
            }
            firstSet {
                count
                created
            }
            mostRecentSet {
                count
                created
            }
        }
        streakData(id: $id) {
            longestStreak
            currentStreak
            longestStreakDates
            currentStreakDates
        }
    }
`;

const UserCard = ({user: {real_name_normalized, title, image_512}, mostRecentSet}) => (
    <Card centered color='blue'>
        <Image src={image_512} wrapped ui={false} />
        <Card.Content>
            <Card.Header>{real_name_normalized}</Card.Header>
            <Card.Description>
                {title}
            </Card.Description>
        </Card.Content>
        <Card.Content extra>
            <Icon name='feed' />
            {mostRecentSet.count} {mostRecentSet.count === 1 ? 'push-up' : 'push-ups'} {formatDistanceToNow(parseISO(mostRecentSet.created), { addSuffix: true })}
        </Card.Content>
    </Card>
);

function User() {
    const router = useRouter();

    const { loading, error, data, fetchMore } = useQuery(GET_USER_STATS, {
        notifyOnNetworkStatusChange: true,
        variables: { id: router.query.id },
    });

    if (!data) return null;

    const {userSlackProfile, userStats: {mostRecentSet}} = data;

    return (
        <Layout>
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width={5}>
                        <UserCard mostRecentSet={mostRecentSet} user={userSlackProfile} />
                    </Grid.Column>
                    <Grid.Column width={11}>
                        <UserStats data={data} />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </Layout>
    );
}

export default withData(props => <User />);
