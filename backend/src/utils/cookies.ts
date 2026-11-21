import { Response } from 'express';
import { env } from '../config/env';

export const REFRESH_COOKIE = 'cardsafe_refresh';

const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  // The frontend (vercel.app) and backend (onrender.com) are different sites,
  // so the refresh cookie must be sent cross-site. SameSite=None (with Secure)
  // is required in production; local dev stays Lax for localhost convenience.
  sameSite: (env.nodeEnv === 'production' ? 'none' : 'lax') as 'none' | 'lax',
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
