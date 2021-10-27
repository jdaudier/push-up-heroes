import { ApolloClient, InMemoryCache } from "@apollo/client";

// For local dev: http://localhost:3000/api/graphql
const client = new ApolloClient({
    uri: "https://pushupheroes.com/api/graphql",
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
        },
    },
});

export default client;