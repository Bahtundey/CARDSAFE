import { GRAPHQL_URL } from './config';
import { REFRESH_TOKEN_QUERY_STRING, AuthUser } from './graphql/operations';

export interface Session {
  accessToken: string | null;
  user: AuthUser | null;
}

let session: Session = { accessToken: null, user: null };
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function setSession(next: Session): void {
  session = next;
  emit();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): Session {
  return session;
}

export function getServerSnapshot(): Session {
  return { accessToken: null, user: null };
}

export function getAccessToken(): string | null {
  return session.accessToken;
}

export function setAuthSession(accessToken: string, user: AuthUser): void {
  setSession({ accessToken, user });
}

export function updateSessionUser(user: AuthUser): void {
  setSession({ ...session, user });
}

export function clearSession(): void {
  setSession({ accessToken: null, user: null });
}

let refreshInFlight: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ query: REFRESH_TOKEN_QUERY_STRING }),
    });
    if (!res.ok) {
      clearSession();
      return null;
    }
    const json = await res.json();
    const payload = json?.data?.refreshToken;
    if (!payload?.accessToken || !payload?.user) {
      clearSession();
      return null;
    }
    setSession({ accessToken: payload.accessToken, user: payload.user });
    return payload.accessToken;
  } catch {
    clearSession();
    return null;
  }
}

/** Refresh the session using the httpOnly cookie. Coalesces concurrent callers. */
export function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}
