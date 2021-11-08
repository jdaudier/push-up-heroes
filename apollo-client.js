import { ApolloClient, InMemoryCache } from "@apollo/client";

const env = process.env.NODE_ENV

const uri = env === 'development' ? 'http://localhost:3000/api/graphql' : 'https://pushupheroes.com/api/graphql';

// For local dev: http://localhost:3000/api/graphql
const client = new ApolloClient({
    uri,
    cache: new InMemoryCache(),
    defaultOptions: {
        query: {
            fetchPolicy: 'network-only'
        },
        watchQuery: {
            fetchPolicy: 'no-cache',
        },
    },
});

export default client;