import {
  ApolloClient,
  InMemoryCache,
  from,
  HttpLink,
  Observable,
  fromPromise,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { GRAPHQL_URL } from './config';
import { getAccessToken, refreshAccessToken } from './auth-store';

const httpLink = new HttpLink({ uri: GRAPHQL_URL, credentials: 'include' });

const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// Auth operations must never trigger an automatic refresh (avoids loops).
const NO_REFRESH_OPERATIONS = new Set(['Login', 'Register', 'RefreshToken', 'Logout']);

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (!graphQLErrors) return;

  const unauthenticated = graphQLErrors.some(
    (e) => e.extensions?.code === 'UNAUTHENTICATED'
  );
  if (!unauthenticated) return;
  if (NO_REFRESH_OPERATIONS.has(operation.operationName)) return;

  return fromPromise(refreshAccessToken()).flatMap((token) => {
    if (!token) {
      return new Observable((observer) => {
        observer.error(new Error('Your session has expired. Please sign in again.'));
      });
    }
    // refreshAccessToken() already stored the new token, so authLink re-reads it.
    return forward(operation);
  });
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
