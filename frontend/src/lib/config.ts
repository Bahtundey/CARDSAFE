// Single source of truth for the backend origin, injected at build time via
// NEXT_PUBLIC_GRAPHQL_URL (configured in the Vercel Production environment).
// Backend secrets live behind this URL and are never exposed to client code.

const LOCAL_GRAPHQL_URL = 'http://localhost:4000/graphql';

function resolveGraphQLUrl(): string {
  const configured = process.env.NEXT_PUBLIC_GRAPHQL_URL;
  if (configured && configured.trim()) {
    let url = configured.trim().replace(/\/+$/, '');
    // Accept either the full endpoint (…/graphql) or the bare backend origin.
    // The Apollo client must always target the GraphQL route, never the root.
    if (!/\/graphql$/.test(url)) {
      url = `${url}/graphql`;
    }
    return url;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_GRAPHQL_URL is not configured. Set it to your deployed GraphQL ' +
        'endpoint (e.g. https://cardsafe-ojoi.onrender.com/graphql) in the Vercel ' +
        'Production environment variables.'
    );
  }

  // Local development only — never reached in production builds.
  return LOCAL_GRAPHQL_URL;
}

export const GRAPHQL_URL: string = resolveGraphQLUrl();

// REST endpoints (media upload at /api/upload) live on the same backend origin
// as the GraphQL endpoint.
const API_ORIGIN = GRAPHQL_URL.replace(/\/graphql$/, '');
export const API_URL: string = API_ORIGIN;
export const UPLOAD_URL: string = `${API_ORIGIN}/api/upload`;
