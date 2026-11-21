import { GraphQLScalarType, Kind } from 'graphql';

function toDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'ISO-8601 date-time string',
  serialize(value: unknown): string | null {
    const d = toDate(value);
    return d ? d.toISOString() : null;
  },
  parseValue(value: unknown): Date | null {
    return toDate(value);
  },
  parseLiteral(ast): Date | null {
    if (ast.kind === Kind.STRING) {
      return toDate(ast.value);
    }
    return null;
  },
});
