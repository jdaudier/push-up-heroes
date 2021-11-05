import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import client from "../../apollo-client";
import { gql } from "@apollo/client";
import {Grid, Card, Image, Icon, Header, Loader, Dimmer} from 'semantic-ui-react'
import Layout from '../../components/Layout';
import UserStats from '../../components/UserStats';
import StreaksCalendar from '../../components/StreaksCalendar';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import parseISO from 'date-fns/parseISO';
import ClientOnly from '../../components/ClientOnly';
const UserChart = dynamic(() => import('../../components/UserChart'));
const UserChartSets = dynamic(() => import('../../components/UserChartSets'));
const UserFeed = dynamic(() => import('../../components/UserFeed'));

/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';

const GET_USER_STATS = gql`
    query userStats($id: ID!) {
        userSlackProfile(id: $id) {
            real_name
            title
            image_512
            image_original
        }
        pushUpsByUser(id: $id) {
            sorted {
                count
                humanReadableCreated
            }
            byDay {
                label
                value
            }
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
            bestDailyTotal {
                created
                count
            }
        }
        streakData(id: $id) {
            challengeStartDate
            countsByDayMap
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

const UserCard = ({user: {real_name, title, image_512, image_original}, mostRecentSet}) => (
    <div css={cardWrapperCss}>
        <Card color='blue'>
            <Image src={image_512 || image_original} wrapped ui={false} />
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

const mockUser = {
    real_name: 'Dwayne Johnson',
    title: 'Kicking Your Ass at Push-Ups',
    image_512: '/images/the-rock.jpg'
};

function LoadingUserCard({user: {real_name, title, image_512}}) {
    return (
        <div css={cardWrapperCss}>
            <Card color='blue'>
                <Image src={image_512} wrapped ui={false} />
                <Dimmer active inverted>
                    <Loader size='massive' />
                </Dimmer>
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
    )
}

export async function getServerSideProps(context) {
    const { id } = context.query;

    const { data } = await client.query({
        query: GET_USER_STATS,
        variables: { id }
    });

    return {
        props: { data },
    };
}

export default function User({ data }) {
    const router = useRouter();
    const id = router.query.id;

    return (
        <Layout>
            <Grid stackable>
                <Grid.Row>
                    <Grid.Column width={5}>
                        {data ?
                            <UserCard mostRecentSet={data.userStats.mostRecentSet} user={data.userSlackProfile} />
                            :
                            <LoadingUserCard user={mockUser} />
                        }
                    </Grid.Column>
                    <Grid.Column width={11}>
                        <UserStats data={data} />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
            <StreaksCalendar
                challengeStartDate={data ? data.streakData.challengeStartDate : undefined}
                countsByDayMap={data ? data.streakData.countsByDayMap : {}}
            />
            {data && <UserChart dailyAvg={data.userStats.dailyAvg} data={data.pushUpsByUser.byDay} />}
            {data && <UserChartSets avgSet={data.userStats.avgSet} data={data.pushUpsByUser.sorted} />}
            {data && <Header as='h2'>Feed</Header>}
            {data &&
            <ClientOnly>
                <UserFeed
                    bestSetCount={data.userStats.bestSet.count}
                    id={id}
                    name={data ? data.userSlackProfile.real_name : ''}
                    totalPushUps={data.userStats.totalPushUps}
                    totalSets={data.userStats.totalSets}
                />
            </ClientOnly>
            }
        </Layout>
    );
}
