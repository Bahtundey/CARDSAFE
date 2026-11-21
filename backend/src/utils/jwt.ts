import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
  sub: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  tokenVersion: number;
}

const accessExpiry = env.accessTokenExpiry as SignOptions['expiresIn'];
const refreshExpiry = env.refreshTokenExpiry as SignOptions['expiresIn'];

export function signAccessToken(userId: string): string {
  const payload: AccessTokenPayload = { sub: userId, type: 'access' };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: accessExpiry });
}

export function signRefreshToken(userId: string, tokenVersion: number): string {
  const payload: RefreshTokenPayload = { sub: userId, type: 'refresh', tokenVersion };
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: refreshExpiry });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (typeof decoded === 'string') throw new Error('Invalid token');
  return decoded as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const decoded = jwt.verify(token, env.jwtRefreshSecret);
  if (typeof decoded === 'string') throw new Error('Invalid token');
  return decoded as RefreshTokenPayload;
}
