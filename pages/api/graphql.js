import { ApolloServer, ApolloError, gql } from 'apollo-server-micro'
import { getFullLeaderboardData, getLeaderboardText,  getDailySetsByUserId, getMostRecentSet, getUserStats, getTotalPushUpsCount, getStreakData } from '../../utils/firebaseQueries';
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
        userStats(id: ID!): UserStats!
        streakData(id: ID!): Streak!
    }
    interface Set {
        id: ID!
        name: String!
        count: Int!
        profile: SlackProfile!
        created: Date!
    }
    interface IndividualSet {
        count: Int!
        created: Date!
    }
    type UserStats {
        ranking: Int!
        totalPushUps: Int!
        dailyAvg: Int!
        catchTheLeader: Int!
        contributionPercentage: Int!
        bestSet: BestSetByUser!
        firstSet: FirstSetByUser!
        mostRecentSet: MostRecentSetByUser!
    }
    type Streak {
        currentStreak: Int!
        longestStreak: Int!
    }
    type BestSetByUser implements IndividualSet {
        count: Int!
        created: Date!
    }
    type FirstSetByUser implements IndividualSet {
        count: Int!
        created: Date!
    }
    type MostRecentSetByUser implements IndividualSet {
        count: Int!
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
        dailyAvg: Int!
        contributionPercentage: Int!
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
            return null;
        },
    },
    IndividualSet: {
        __resolveType(set, context, info){
            return null;
        },
    },
    Query: {
        async leaderboard () {
            try {
                return await getFullLeaderboardData();
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

        async userStats (parent, {id}) {
            try {
                return await getUserStats(id);
            } catch (error) {
                throw new ApolloError(`Error getting user ${id} stats!`, 500, error);
            }
        },

        async streakData (parent, {id}) {
            try {
                return await getStreakData(id);
            } catch (error) {
                throw new ApolloError(`Error getting user ${id} streak data!`, 500, error);
            }
        },

        async totalPushUps () {
            try {
               return await getTotalPushUpsCount();
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
