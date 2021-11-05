import { ApolloServer, ApolloError, gql } from 'apollo-server-micro';
import Cors from "micro-cors";
import { getFullLeaderboardData, getLeaderboardText, getGlobalChartData, getPushUpsByUserId, getMostRecentSet, getUserStats, getStreakData, getUserFeed, getAllUsersFeeds } from '../../utils/firebaseQueries';
import getSlackProfile from '../../utils/getSlackProfile';

const typeDefs = gql`
    scalar GraphQLJSON
    scalar Date

    type Query {
        leaderboard: Leaderboard!
        summary: String!
        mostRecentSet: MostRecentSet!
        globalUsersFeed(page: Int!): GlobalUsersFeedData!
        globalChartData: [CountByDay!]!
        
        pushUpsByUser(id: ID!): PushUpsByUser!
        userSlackProfile(id: ID!): SlackProfile!
        userStats(id: ID!): UserStats!
        streakData(id: ID!): Streak!
        userFeed(id: ID! page: Int!): UserFeedData!
    }
    interface Rank {
        id: ID!
        name: String!
        count: Int!
        profile: SlimSlackProfile!
    }
    enum DayOfWeek {
        Mon
        Tue
        Wed
        Thu
        Fri
        Sat
        Sun
    }
    interface Feed {
        count: Int!
        dayOfWeek: DayOfWeek!
        date: Date!
        time: String!
        simplifiedDate: Date!
    }
    type Set {
        id: ID!
        name: String!
        count: Int!
        profile: SlimSlackProfile!
        timeZone: String!
        created: Date!
        rawCreated: Date!
        humanReadableCreated: Date!
    }
    type PushUpsByUser {
        sorted: [Set!]!
        byDay: [CountByDay!]!
    }
    type GlobalUsersFeedData {
        feed: [GlobalUserFeed!]!
        setsByDayMap: GraphQLJSON
    }
    type UserFeedData {
        feed: [UserFeed!]!
        setsByDayMap: GraphQLJSON
    }
    type UserStats {
        ranking: Int!
        totalPushUps: Int!
        totalSets: Int!
        dailyAvg: Int!
        globalDailyAvg: Int!
        avgSet: Int!
        globalAvgSet: Int!
        catchTheLeader: Int!
        contributionPercentage: Int!
        bestSet: BestSet!
        firstSet: FirstSet!
        mostRecentSet: IndividualSet!
        firstPlaceAthlete: BasicRanking!
        globalBestIndividualSet: BestIndividualSet!
        bestDailyTotal: BestIndividualDailyTotal!
    }
    type GlobalUserFeed implements Feed {
        name: String!
        profile: SlimSlackProfile!
        count: Int!
        dayOfWeek: DayOfWeek!
        date: Date!
        time: String!
        slackId: ID!
        simplifiedDate: Date!
    }
    type UserFeed implements Feed {
        count: Int!
        dayOfWeek: DayOfWeek!
        date: Date!
        time: String!
        simplifiedDate: Date!
    }
    type Streak {
        challengeStartDate: Date!
        countsByDayMap: GraphQLJSON!
        longestStreak: Int!
        currentStreak: Int!
        longestStreakDates: String!
        longestStreakDatesShort: String!
        currentStreakDates: String!
        currentStreakDatesShort: String!
    }
    type BestSet {
        count: Int!
        created: [Date!]!
        createdShort: [Date!]!
    }
    type FirstSet {
        count: Int!
        created: Date!
        createdShort: Date!
    }
    type IndividualSet {
        count: Int!
        created: Date!
    }
    type CountByDay {
        label: Date!
        value: Int!
    }
    type MostRecentSet {
        id: ID!
        name: String!
        count: Int!
        profile: SlimSlackProfile!
        created: Date!
    }
    type BestIndividualSet {
        count: Int!
        athletes: [BestIndividualSetAthlete!]!
    }
    type ProfileWithId {
        id: String!
        date: Date!
        real_name: String!
        image_original: String
        image_24: String!
        image_32: String!
        image_48: String!
        image_72: String!
        image_192: String!
        image_512: String!
    }
    type BestDailyTotalOverall {
        profiles: [ProfileWithId]!
        count: Int!
    }
    type BestIndividualDailyTotal {
        created: [String]!
        count: Int!
    }
    type BestIndividualSetAthlete {
        id: ID!
        name: String!
        count: Int!
        profile: SlimSlackProfile!
        created: Date!
    }
    type BasicRanking implements Rank {
        id: ID!
        name: String!
        count: Int!
        dailyAvg: Int!
        avgSet: Int!
        profile: SlimSlackProfile!
    }
    type Ranking implements Rank {
        id: ID!
        name: String!
        count: Int!
        totalSets: Int!
        profile: SlimSlackProfile!
        dailyAvg: Int!
        contributionPercentage: Int!
    }
    type Leaderboard {
        rankings: [Ranking]
        totalPushUps: Int!
        totalSets: Int
        totalAthletes: Int
        avgSet: Int
        bestIndividualSet: BestIndividualSet
        dailyAvg: Int
        bestDailyTotalOverall: BestDailyTotalOverall
    }
    interface Profile {
        real_name: String!
        image_original: String
        image_24: String!
        image_32: String!
        image_48: String!
        image_72: String!
        image_192: String!
        image_512: String!
    }
    type SlimSlackProfile implements Profile {
        real_name: String!
        image_original: String
        image_24: String!
        image_32: String!
        image_48: String!
        image_72: String!
        image_192: String!
        image_512: String!
    }
    type SlackProfile implements Profile {
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
        image_original: String
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
    Rank: {
        __resolveType(rank, context, info) {
            if (rank.dailyAvg || rank.contributionPercentage){
                return 'Ranking';
            }

            return 'BasicRanking';
        },
    },
    Feed: {
        __resolveType(feed, context, info) {
            if (feed.name || feed.profile) {
                return 'GlobalUserFeed';
            }

            return 'UserFeed';
        },
    },
    Profile: {
        __resolveType(profile, context, info) {
            if (profile.real_name_normalized || profile.title) {
                return 'SlackProfile';
            }

            return 'SlimSlackProfile';
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

        async mostRecentSet () {
            try {
                return await getMostRecentSet();
            } catch (error) {
                throw new ApolloError('Error getting most recent set!', 500, error);
            }
        },

        async globalUsersFeed (parent, {page}) {
            try {
                return await getAllUsersFeeds({page});
            } catch (error) {
                throw new ApolloError("Error getting global feed!", 500, error);
            }
        },

        async globalChartData () {
            try {
                return await getGlobalChartData();
            } catch (error) {
                throw new ApolloError("Error getting global chart data!", 500, error);
            }
        },

        async summary () {
            try {
                return await getLeaderboardText();
            } catch (error) {
                throw new ApolloError('Error getting summary!', 500, error);
            }
        },

        // INDIVIDUAL QUERIES

        async userStats (parent, {id}) {
            try {
                return await getUserStats(id);
            } catch (error) {
                throw new ApolloError(`Error getting user ${id} stats!`, 500, error);
            }
        },

        async userSlackProfile (parent, {id}) {
            try {
                return await getSlackProfile(id);
            } catch (error) {
                throw new ApolloError(`Error getting Slack profile for ${id}!`, 500, error);
            }
        },

        async pushUpsByUser (parent, {id}) {
            try {
                return await getPushUpsByUserId(id);
            } catch (error) {
                throw new ApolloError(`Error getting user ${id} data!`, 500, error);
            }
        },

        async streakData (parent, {id}) {
            try {
                return await getStreakData(id);
            } catch (error) {
                throw new ApolloError(`Error getting user ${id} streak data!`, 500, error);
            }
        },

        async userFeed(parent, {id, page}) {
            try {
                return await getUserFeed({id, page});
            } catch (error) {
                throw new ApolloError(`Error getting user feed for ${id}!`, 500, error);
            }
        }
    },
};

const cors = Cors({
    origin: "https://studio.apollographql.com",
    allowCredentials: true,
});

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    playground: true,
    engine: {
        apiKey: process.env.graphManagerApiKey,
        graphVariant: "production"
    }
});

const startServer = apolloServer.start();

export default cors(async (req, res) => {
    if (req.method === "OPTIONS") {
        res.end();
        return false;
    }
    await startServer;
    await apolloServer.createHandler({
        path: "/api/graphql",
    })(req, res);
});

export const config = {
    api: {
        bodyParser: false
    }
};

