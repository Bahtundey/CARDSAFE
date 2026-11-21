import { Response } from 'express';
import { env } from '../config/env';

export const REFRESH_COOKIE = 'cardsafe_refresh';

const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = {
  httpOnly: true,
  // Controlled by COOKIE_SECURE (default true) — NOT inferred from NODE_ENV,
  // which is not reliably 'production' on every host. Secure + SameSite=None is
  // required in production because the frontend (vercel.app) and backend
  // (onrender.com) are different sites; local dev sets COOKIE_SECURE=false.
  secure: env.cookieSecure,
  sameSite: (env.cookieSecure ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
};

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    ...cookieOptions,
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, cookieOptions);
}

// Startup diagnostic — logs cookie ATTRIBUTES only, never the token value.
export function cookieConfigSummary(): string {
  return `httpOnly=${cookieOptions.httpOnly} secure=${cookieOptions.secure} sameSite=${cookieOptions.sameSite} path=${cookieOptions.path}`;
}
