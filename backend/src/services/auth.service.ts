import { User, IUser } from '../models';
import { hashPassword, comparePassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken, RefreshTokenPayload } from '../utils/jwt';
import { Errors } from '../utils/errors';
import * as auditService from './audit.service';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AuthResult {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function issueTokens(user: IUser): AuthResult {
  return {
    user,
    accessToken: signAccessToken(user._id.toString()),
    refreshToken: signRefreshToken(user._id.toString(), user.tokenVersion),
  };
}

export async function register(input: RegisterInput): Promise<IUser> {
  const name = input.name?.trim() ?? '';
  const email = input.email?.trim().toLowerCase() ?? '';

  if (name.length < 2) {
    throw Errors.badInput('Name must be at least 2 characters.');
  }
  if (!EMAIL_RE.test(email)) {
    throw Errors.badInput('A valid email address is required.');
  }
  if (!input.password || input.password.length < 8) {
    throw Errors.badInput('Password must be at least 8 characters.');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw Errors.conflict('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(input.password);
  // Role is always assigned server-side; a client can never self-select it.
  // Registration deliberately does NOT issue tokens — the user must sign in.
  return User.create({
    name,
    email,
    passwordHash,
    role: 'USER',
    isActive: true,
    isVerified: false,
    tokenVersion: 0,
  });
}

export async function login(input: LoginInput, ip?: string | null): Promise<AuthResult> {
  const email = input.email?.trim().toLowerCase() ?? '';
  const user = await User.findOne({ email }).select('+passwordHash');

  // Identical message whether the email or password was wrong — no account enumeration.
  if (!user || !(await comparePassword(input.password ?? '', user.passwordHash))) {
    await auditService.log({
      action: 'failed_login',
      actorId: user?._id ?? null,
      targetType: 'User',
      metadata: { email },
      ip,
    });
    throw Errors.badInput('Invalid email or password.');
  }
  if (!user.isActive) {
    throw Errors.forbidden('This account has been deactivated. Contact support.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  await auditService.log({
    action: user.role === 'ADMIN' ? 'admin_login' : 'login',
    actorId: user._id,
    targetType: 'User',
    metadata: { email },
    ip,
  });

  return issueTokens(user);
}

export async function refresh(refreshToken: string | undefined): Promise<AuthResult> {
  if (!refreshToken) {
    throw Errors.unauthenticated();
  }

  let payload: RefreshTokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw Errors.unauthenticated();
  }

  if (payload.type !== 'refresh') {
    throw Errors.unauthenticated();
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw Errors.unauthenticated();
  }
  if (user.tokenVersion !== payload.tokenVersion) {
    throw Errors.unauthenticated();
  }

  return issueTokens(user);
}

export async function logout(user: IUser): Promise<boolean> {
  // Bump the token version so every previously issued refresh token is revoked.
  await User.updateOne({ _id: user._id }, { $inc: { tokenVersion: 1 } });
  return true;
}

export async function changePassword(
  user: IUser,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  const fresh = await User.findById(user._id).select('+passwordHash');
  if (!fresh) {
    throw Errors.unauthenticated();
  }

  if (!(await comparePassword(currentPassword, fresh.passwordHash))) {
    throw Errors.badInput('Current password is incorrect.');
  }
  if (!newPassword || newPassword.length < 8) {
    throw Errors.badInput('New password must be at least 8 characters.');
  }

  fresh.passwordHash = await hashPassword(newPassword);
  await fresh.save();
  return true;
}
