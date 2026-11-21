import { GraphQLError } from 'graphql';

export type ErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'BAD_USER_INPUT'
  | 'CONFLICT'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR';

/**
 * AppError is a GraphQLError carrying a machine-readable `code` in extensions.
 * We intentionally do NOT attach an HTTP status: the GraphQL endpoint always
 * returns 200 and communicates failures through the `errors` array, which is
 * what Apollo Client parses into `graphQLErrors` (driving the auto-refresh
 * flow and clean user-facing messages).
 */
export class AppError extends GraphQLError {
  constructor(message: string, code: ErrorCode) {
    super(message, { extensions: { code } });
  }
}

export const Errors = {
  unauthenticated: (message = 'Authentication required.') =>
    new AppError(message, 'UNAUTHENTICATED'),
  forbidden: (message = 'You are not authorized to perform this action.') =>
    new AppError(message, 'FORBIDDEN'),
  badInput: (message: string) => new AppError(message, 'BAD_USER_INPUT'),
  conflict: (message: string) => new AppError(message, 'CONFLICT'),
  notFound: (message = 'Resource not found.') => new AppError(message, 'NOT_FOUND'),
};
