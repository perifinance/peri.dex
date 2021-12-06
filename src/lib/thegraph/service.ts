import { ApolloClient, InMemoryCache } from '@apollo/client'
const API_URL = process.env.REACT_APP_THEGRAPH_URL;

export const get = ({url, query, mapping, variables, errorCallback}) => {
    const client = new ApolloClient({
        uri: API_URL + url,
        cache: new InMemoryCache(),
    });
    return client
    .query({
      query,
      variables
    })
    .then((data) => mapping(data))
    .catch(errorCallback)
}

