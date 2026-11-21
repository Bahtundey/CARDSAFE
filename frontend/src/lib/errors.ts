import { ApolloError } from '@apollo/client';

export function extractErrorMessage(error: unknown): string {
  if (error instanceof ApolloError) {
    const graphQlError = error.graphQLErrors?.[0];
    if (graphQlError?.message) {
      return graphQlError.message;
    }
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
