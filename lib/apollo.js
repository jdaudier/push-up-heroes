import { withData } from "next-apollo";
import { HttpLink } from "apollo-boost";

const config = {
    link: new HttpLink({
        uri: "https://push-up-heroes.now.sh/api/graphql", // Server URL (must be absolute)
        // TODO: Add this back later
        // opts: {
        //     credentials: "same-origin" // Additional fetch() options like `credentials` or `headers`
        // }
    })
};

export default withData(config);
