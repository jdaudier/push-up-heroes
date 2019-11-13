import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import withData from '../../lib/apollo';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import { Grid, Card, Image, Icon, Header } from 'semantic-ui-react'
import Layout from '../../components/Layout';
import UserStats from '../../components/UserStats';
import LoadingUserView from '../../components/LoadingUserView';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import parseISO from 'date-fns/parseISO';
const UserChart = dynamic(() => import('../../components/UserChart'));
const UserFeed = dynamic(() => import('../../components/UserFeed'));

/** @jsx jsx */
import { jsx } from '@emotion/core';

const GET_USER_STATS = gql`
    query userStats($id: ID!) {
        userSlackProfile(id: $id) {
            real_name
            title
            image_512
        }
        dailyPushUpsByUser(id: $id) {
            label
            value
        }
        userStats(id: $id) {
            totalPushUps
            totalSets
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
            firstPlaceAthlete {
                id
                count
                profile {
                    image_48
                    real_name
                }
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

const cardWrapperCss = {
    display: 'block',
    '@media(max-width: 767px)': {
        display: 'flex',
        justifyContent: 'center',
    }
};

const UserCard = ({user: {real_name, title, image_512}, mostRecentSet}) => (
    <div css={cardWrapperCss}>
        <Card color='blue'>
            <Image src={image_512} wrapped ui={false} />
            <Card.Content>
                <Card.Header>{real_name}</Card.Header>
                <Card.Description>
                    {title}
                </Card.Description>
            </Card.Content>
            <Card.Content extra style={{color: 'rgba(0, 0, 0, .5)'}}>
                <Icon name='feed' />
                {mostRecentSet.count} {mostRecentSet.count === 1 ? 'push-up' : 'push-ups'} {formatDistanceToNow(parseISO(mostRecentSet.created), { addSuffix: true })}
            </Card.Content>
        </Card>
    </div>
);

function User() {
    const router = useRouter();

    const id = router.query.id;
    const { loading, error, data } = useQuery(GET_USER_STATS, {
        variables: { id },
    });

    if (loading || !data) {
        return <LoadingUserView />
    }

    const {
        userSlackProfile,
        userStats: {
            mostRecentSet,
            dailyAvg,
            totalPushUps,
            totalSets,
            bestSet,
        },
        dailyPushUpsByUser,
    } = data;

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
            <UserChart dailyAvg={dailyAvg} data={dailyPushUpsByUser} />
            <Header as='h2'>Your Feed</Header>
            <UserFeed
                bestSetCount={bestSet.count}
                id={id}
                totalPushUps={totalPushUps}
                totalSets={totalSets}
            />
        </Layout>
    );
}

export default withData(props => <User />);
