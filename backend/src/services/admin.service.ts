import { User, Trade, Withdrawal, KYC, Wallet, IUser, IWallet } from '../models';
import { Errors } from '../utils/errors';
import { round2 } from '../utils/money';
import * as walletService from './wallet.service';
import * as auditService from './audit.service';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingTrades: number;
  completedTrades: number;
  pendingWithdrawals: number;
  pendingKyc: number;
  walletLiabilities: number;
  totalVolume: number;
}

export async function getDashboardStats(): Promise<AdminStats> {
  const [
    totalUsers,
    activeUsers,
    pendingTrades,
    completedTrades,
    pendingWithdrawals,
    pendingKyc,
    walletAgg,
    volumeAgg,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Trade.countDocuments({ status: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
    Trade.countDocuments({ status: { $in: ['APPROVED', 'COMPLETED'] } }),
    Withdrawal.countDocuments({ status: 'PENDING' }),
    KYC.countDocuments({ status: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
    Wallet.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
    Trade.aggregate([{ $match: { status: 'APPROVED' } }, { $group: { _id: null, total: { $sum: '$payoutAmount' } } }]),
  ]);

  return {
    totalUsers,
    activeUsers,
    pendingTrades,
    completedTrades,
    pendingWithdrawals,
    pendingKyc,
    walletLiabilities: round2(walletAgg[0]?.total ?? 0),
    totalVolume: round2(volumeAgg[0]?.total ?? 0),
  };
}

export async function listAllUsers(search?: string): Promise<IUser[]> {
  const filter = search
    ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
    : {};
  return User.find(filter).sort({ createdAt: -1 }).limit(200);
}

export async function suspendUser(id: string, admin: IUser, ip?: string | null): Promise<IUser> {
  const user = await User.findById(id);
  if (!user) throw Errors.notFound('User not found.');
  if (user.role === 'ADMIN') throw Errors.badInput('Cannot suspend an administrator.');

  user.isActive = false;
  await user.save();

  await auditService.log({
    action: 'user_suspended',
    actorId: admin._id,
    targetId: user._id,
    targetType: 'User',
    metadata: { email: user.email },
    ip,
  });

  return user;
}

export async function activateUser(id: string, admin: IUser, ip?: string | null): Promise<IUser> {
  const user = await User.findById(id);
  if (!user) throw Errors.notFound('User not found.');

  user.isActive = true;
  await user.save();

  await auditService.log({
    action: 'user_activated',
    actorId: admin._id,
    targetId: user._id,
    targetType: 'User',
    metadata: { email: user.email },
    ip,
  });

  return user;
}

export async function adjustWallet(
  userId: string,
  amount: number,
  reason: string,
  admin: IUser,
  ip?: string | null
): Promise<IWallet> {
  const parsed = round2(Number(amount));
  if (!Number.isFinite(parsed) || parsed === 0) {
    throw Errors.badInput('Enter a non-zero amount.');
  }
  const user = await User.findById(userId);
  if (!user) throw Errors.notFound('User not found.');

  const description = reason?.trim() || 'Manual adjustment';
  const metadata = { adminId: admin._id.toString() };

  const result =
    parsed > 0
      ? await walletService.credit(user._id, parsed, { type: 'ADJUSTMENT', description, metadata })
      : await walletService.debit(user._id, Math.abs(parsed), { type: 'ADJUSTMENT', description, metadata });

  await auditService.log({
    action: 'wallet_adjusted',
    actorId: admin._id,
    targetId: user._id,
    targetType: 'User',
    metadata: { amount: parsed, reason: description },
    ip,
  });

  return result.wallet;
}
