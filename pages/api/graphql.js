import { ApolloServer, ApolloError, gql } from 'apollo-server-micro'
import fetch from 'isomorphic-unfetch';
import { getUsers, getUserStatsById } from '../../utils/firebaseQueries';
import getLeaderboardText from '../../utils/getLeaderboardText';

const typeDefs = gql`
    scalar GraphQLJSON
    scalar Date

    type Query {
        leaderboard: [User!]!
        userStats(id: String!): [User]!
        summary: String!
        totalPushUps: Int!
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
    type User {
        id: ID!
        name: String!
        count: Int!
        profile: SlackProfile!
        created: Date!
    }
`;

const resolvers = {
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

                    return {
                        ...acc,
                        slackIdMap: {
                            ...acc.slackIdMap,
                            [name]: id,
                        },
                        leaderboard: {
                            ...acc.leaderboard,
                            [name]: acc.leaderboard[name] ? acc.leaderboard[name] + count : count,
                        },
                    }
                }, {
                    slackIdMap: {},
                    leaderboard: {},
                });

                const getProfileData = async (userSlackId) => {
                    const user = await fetch(`https://slack.com/api/users.profile.get?user=${userSlackId}`, {
                        headers: {
                            'Content-type': 'application/json',
                            Authorization: `Bearer ${process.env.supremeLeadersSlackToken}`,
                        }
                    });

                    const data = await user.json();
                    return Promise.resolve(data.profile);
                };

                const leaderArr = await Promise.all(Object.keys(data.leaderboard).map(async (name) => {
                    const slackId = data.slackIdMap[name];
                    return {
                        name,
                        count: data.leaderboard[name],
                        id:slackId,
                        profile: await getProfileData(slackId)
                    };
                }));

                return [...leaderArr].sort((aPerson, bPerson) => {
                    const aCount = aPerson.count;
                    const bCount = bPerson.count;
                    return bCount - aCount;
                });
            } catch (error) {
                throw new ApolloError('Error getting leaderboard!', 500, error);
            }
        },

        async userStats (parent, {id}) {
            try {
                return await getUserStatsById(id);
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
