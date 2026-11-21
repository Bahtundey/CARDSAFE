'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  useState,
  ReactNode,
} from 'react';
import { useMutation } from '@apollo/client';
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LOGOUT_MUTATION,
  AuthUser,
} from './graphql/operations';
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  setAuthSession,
  clearSession,
  refreshAccessToken,
} from './auth-store';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [loading, setLoading] = useState(true);

  const [loginMutate] = useMutation(LOGIN_MUTATION);
  const [registerMutate] = useMutation(REGISTER_MUTATION);
  const [logoutMutate] = useMutation(LOGOUT_MUTATION);

  // Restore an existing session from the httpOnly refresh cookie on load.
  useEffect(() => {
    let cancelled = false;
    refreshAccessToken().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await loginMutate({ variables: { input: { email, password } } });
      setAuthSession(data.login.accessToken, data.login.user);
    },
    [loginMutate]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      // Registration creates the account but does NOT establish a session.
      // The caller redirects to the login page afterwards.
      await registerMutate({
        variables: { input: { name, email, password } },
      });
    },
    [registerMutate]
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutate();
    } catch {
      // Best effort — the local session is cleared regardless.
    }
    clearSession();
  }, [logoutMutate]);

  const value = useMemo(
    () => ({ user: session.user, loading, login, register, logout }),
    [session.user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
