import { ApolloServer, ApolloError, gql } from 'apollo-server-micro'
import { getUsers, getDailySetsByUserId, getMostRecentSet, getTotalChallengeDays } from '../../utils/firebaseQueries';
import getLeaderboardText from '../../utils/getLeaderboardText';
import getSlackProfile from '../../utils/getSlackProfile';

const typeDefs = gql`
    scalar GraphQLJSON
    scalar Date

    type Query {
        leaderboard: Leaderboard!
        dailySetsByUser(id: ID!): [CountByDay]!
        summary: String!
        totalPushUps: Int!
        mostRecentSet: MostRecentSet!
        userSlackProfile(id: ID!): SlackProfile!
    }
    interface Set {
        id: ID!
        name: String!
        count: Int!
        profile: SlackProfile!
        created: Date!
    }
    type CountByDay {
        name: Date!
        value: Int!
    }
    type BestIndividualSet implements Set {
        id: ID!
        name: String!
        count: Int!
        profile: SlackProfile!
        created: Date!
    }
    type MostRecentSet implements Set {
        id: ID!
        name: String!
        count: Int!
        profile: SlackProfile!
        created: Date!
    }
    type Ranking {
        id: ID!
        name: String!
        count: Int!
        profile: SlackProfile!
        dailyAvg: Int
    }
    type Leaderboard {
        rankings: [Ranking]!
        totalPushUps: Int!
        totalAthletes: Int!
        avgSet: Int!
        bestIndividualSet: BestIndividualSet!
        dailyAvg: Int!
    }
    type SlackProfile {
        title: String!
        phone: String!
        skype: String!
        real_name: String!
        real_name_normalized: String!
        display_name: String!
        display_name_normalized: String!
        fields: [GraphQLJSON]
        status_text: String!
        status_emoji: String!
        status_expiration: Int!
        avatar_hash: String!
        image_original: String!
        first_name: String!
        last_name: String!
        image_24: String!
        image_32: String!
        image_48: String!
        image_72: String!
        image_192: String!
        image_512: String!
        image_1024: String!
        status_text_canonical: String!
    }
`;

const resolvers = {
    Set: {
        __resolveType(set, context, info){
            if(set.dailyAvg){
                return 'Ranking';
            }

            return null;
        },
    },
    Query: {
        async leaderboard () {
            try {
                const allRows = await getUsers();
                /*
                    id: "myID",
                    name: "joanne",
                    count: 22,
                    created: "2019-10-07T09:08:22.000Z"
                */
                const data = allRows.reduce((acc, curr) => {
                    const name = curr.name;
                    const count = curr.count;
                    const id = curr.id;
                    const created = curr.created;

                    return {
                        ...acc,
                        slackIdMap: {
                            ...acc.slackIdMap,
                            [id]: name,
                        },
                        leaderboard: {
                            ...acc.leaderboard,
                            [id]: acc.leaderboard[id] ? acc.leaderboard[id] + count : count,
                        },
                        totalPushUps: acc.totalPushUps + count,
                        bestIndividualSet: {
                            count: count > acc.bestIndividualSet.count ? count : acc.bestIndividualSet.count,
                            id: count > acc.bestIndividualSet.count ? id : acc.bestIndividualSet.id,
                            name: count > acc.bestIndividualSet.count ? name : acc.bestIndividualSet.name,
                            created: count > acc.bestIndividualSet.count ? created : acc.bestIndividualSet.created,
                        }
                    }
                }, {
                    slackIdMap: {},
                    leaderboard: {},
                    totalPushUps: 0,
                    bestIndividualSet: {
                        count: 0,
                        id: '',
                        name: '',
                    },
                });

                const {totalPushUps, bestIndividualSet, leaderboard, slackIdMap} = data;
                const totalChallengeDays = await getTotalChallengeDays();

                const leaderArr = await Promise.all(Object.keys(leaderboard).map(async (id) => {
                    const name = slackIdMap[id];
                    const count =  leaderboard[id];
                    return {
                        name,
                        count,
                        id,
                        profile: await getSlackProfile(id),
                        dailyAvg: Math.round(count / totalChallengeDays)
                    };
                }));

                const sortedLeaderboard = [...leaderArr].sort((aPerson, bPerson) => {
                    const aCount = aPerson.count;
                    const bCount = bPerson.count;
                    return bCount - aCount;
                });

                const bestIndividualSetProfile = await getSlackProfile(bestIndividualSet.id);
                return {
                    rankings: sortedLeaderboard,
                    totalPushUps,
                    totalAthletes: sortedLeaderboard.length,
                    avgSet: Math.round(totalPushUps / allRows.length),
                    dailyAvg: Math.round(totalPushUps / totalChallengeDays),
                    bestIndividualSet: {
                        ...bestIndividualSet,
                        profile: bestIndividualSetProfile,
                    },
                }
            } catch (error) {
                throw new ApolloError('Error getting leaderboard!', 500, error);
            }
        },

        async dailySetsByUser (parent, {id}) {
            try {
                return await getDailySetsByUserId(id);
            } catch (error) {
                throw new ApolloError(`Error getting user ${id} data!`, 500, error);
            }
        },

        async totalPushUps () {
            try {
                const allRows = await getUsers();

                return allRows.reduce((acc, curr) => {
                    const count = curr.count;
                    return acc + count;
                }, 0);
            } catch (error) {
                throw new ApolloError('Error getting total push-up count!', 500, error);
            }
        },

        async summary () {
            try {
                return await getLeaderboardText();
            } catch (error) {
                throw new ApolloError('Error getting summary!', 500, error);
            }
        },

        async mostRecentSet () {
            try {
                return await getMostRecentSet();
            } catch (error) {
                throw new ApolloError('Error getting most recent set!', 500, error);
            }
        },

        async userSlackProfile (parent, {id}) {
            try {
                return await getSlackProfile(id);
            } catch (error) {
                throw new ApolloError(`Error getting Slack profile for ${id}!`, 500, error);
            }
        }
    }
};

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
});

export const config = {
    api: {
        bodyParser: false
    }
};

export default apolloServer.createHandler({ path: '/api/graphql' })
