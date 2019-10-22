import { useRouter } from 'next/router';
import withData from '../../lib/apollo';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Layout from '../../components/Layout';
import { Card, Icon, Image } from 'semantic-ui-react'

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
            currentStreak
            longestStreak
        }
    }
`;

const UserCard = ({user: {real_name_normalized, title, image_512}}) => (
    <Card color='blue'>
        <Image src={image_512} wrapped ui={false} />
        <Card.Content>
            <Card.Header>{real_name_normalized}</Card.Header>
            <Card.Description>
                {title}
            </Card.Description>
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

    const {userSlackProfile, dailySetsByUser, userStats, streakData} = data;

    return (
        <Layout>
            <UserCard user={userSlackProfile} />
        </Layout>
    );
}

export default withData(props => <User />);
