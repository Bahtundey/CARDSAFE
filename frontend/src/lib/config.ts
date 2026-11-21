// The only env value exposed to the browser. Backend secrets live behind this
// URL and are never available to Next.js client code.
export const API_URL: string = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
export const GRAPHQL_URL: string = `${API_URL}/graphql`;
export const UPLOAD_URL: string = `${API_URL}/api/upload`;
