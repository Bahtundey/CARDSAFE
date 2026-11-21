import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '../constants/roles';
import { User, IUser } from '../models';
import { AccessTokenPayload } from '../utils/jwt';
import { Errors } from '../utils/errors';
import { AppContext } from '../types/context';

/**
 * Resolve the authenticated user from the request's `Authorization` header.
 *
 * The JWT only carries the user id (and token type). The role, active flag and
 * every other attribute are loaded fresh from MongoDB on each request so a
 * stale token can never grant privileges it no longer has.
 */
export async function getAuthenticatedUser(req: Request): Promise<IUser | null> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;

  const token = header.slice('Bearer '.length).trim();
  if (!token) return null;

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
    if (payload.type !== 'access') return null;

    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return null;

    return user;
  } catch {
    return null;
  }
}

export function requireAuth(ctx: AppContext): IUser {
  if (!ctx.user) {
    throw Errors.unauthenticated();
  }
  return ctx.user;
}

export function requireRole(ctx: AppContext, role: Role): IUser {
  const user = requireAuth(ctx);
  if (user.role !== role) {
    throw Errors.forbidden();
  }
  return user;
}

export function requireAdmin(ctx: AppContext): IUser {
  return requireRole(ctx, 'ADMIN');
}
