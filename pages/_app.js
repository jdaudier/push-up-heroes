import { ApolloProvider } from "@apollo/client";
import client from "../apollo-client";
import 'semantic-ui-css/semantic.min.css'

function App({ Component, pageProps }) {
    return (
        <ApolloProvider client={client}>
            <Component {...pageProps} />
        </ApolloProvider>
    );
}

export default App;