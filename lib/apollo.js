import { withData } from "next-apollo";
import { HttpLink } from "apollo-boost";

const config = {
    link: new HttpLink({
        uri: "https://pushupheroes.com/api/graphql", // Server URL (must be absolute)
        // TODO: Add this back later
        // opts: {
        //     credentials: "same-origin" // Additional fetch() options like `credentials` or `headers`
        // }
    }),
    name: 'push-up-heroes',
    version: 1
};

export default withData(config);
