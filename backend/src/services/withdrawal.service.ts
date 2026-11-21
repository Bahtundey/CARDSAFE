import { Withdrawal, IWithdrawal, IUser } from '../models';
import { Errors } from '../utils/errors';
import { generateReference } from '../utils/ref';
import { round2 } from '../utils/money';
import { DEFAULT_PAYOUT_CURRENCY } from '../constants/finance';
import * as walletService from './wallet.service';
import * as trustService from './trust.service';
import * as notificationService from './notification.service';
import * as auditService from './audit.service';

export interface RequestWithdrawalInput {
  amount: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

const WD_POPULATE = [{ path: 'user' }];

export async function requestWithdrawal(user: IUser, input: RequestWithdrawalInput, ip?: string | null): Promise<IWithdrawal> {
  const amount = round2(Number(input.amount));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw Errors.badInput('Enter a valid withdrawal amount.');
  }

  if (!input.bankName?.trim() || !input.accountName?.trim() || !input.accountNumber?.trim()) {
    throw Errors.badInput('Please provide your bank name, account name and account number.');
  }
  if (!/^[0-9]{10}$/.test(input.accountNumber.trim())) {
    throw Errors.badInput('Account number must be 10 digits.');
  }

  const limits = await trustService.getTrustLimits(user._id);
  if (amount < limits.minWithdrawal) {
    throw Errors.badInput(`Minimum withdrawal is ₦${limits.minWithdrawal}.`);
  }
  if (amount > limits.maxWithdrawalPerRequest) {
    throw Errors.badInput(`Maximum withdrawal per request is ₦${limits.maxWithdrawalPerRequest} (${limits.tier}).`);
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const today = await Withdrawal.aggregate([
    {
      $match: {
        user: user._id,
        createdAt: { $gte: startOfDay },
        status: { $nin: ['CANCELLED', 'REJECTED'] },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const spentToday = today[0]?.total ?? 0;
  if (spentToday + amount > limits.maxWithdrawalPerDay) {
    throw Errors.badInput(`Daily withdrawal limit is ₦${limits.maxWithdrawalPerDay}.`);
  }

  // Hold funds immediately so the money cannot be withdrawn twice.
  await walletService.hold(user._id, amount);

  const withdrawal = await Withdrawal.create({
    user: user._id,
    amount,
    currency: DEFAULT_PAYOUT_CURRENCY,
    bankName: input.bankName.trim(),
    accountName: input.accountName.trim(),
    accountNumber: input.accountNumber.trim(),
    status: 'PENDING',
    reference: generateReference('WD'),
  });

  await notificationService.notify(
    user._id,
    'WITHDRAWAL_SUBMITTED',
    'Withdrawal requested',
    `Your withdrawal of ₦${amount.toLocaleString()} is being reviewed.`
  );
  await auditService.log({
    action: 'withdrawal_requested',
    actorId: user._id,
    targetId: withdrawal._id,
    targetType: 'Withdrawal',
    metadata: { amount, reference: withdrawal.reference },
    ip,
  });

  const hydrated = await Withdrawal.findById(withdrawal._id).populate(WD_POPULATE);
  return hydrated as unknown as IWithdrawal;
}

export async function cancelWithdrawal(user: IUser, id: string): Promise<IWithdrawal> {
  const wd = await Withdrawal.findById(id);
  if (!wd) throw Errors.notFound('Withdrawal not found.');
  if (wd.user.toString() !== user._id.toString()) {
    throw Errors.forbidden('You cannot cancel this withdrawal.');
  }
  if (wd.status !== 'PENDING') {
    throw Errors.badInput('Only pending withdrawals can be cancelled.');
  }

  await walletService.release(user._id, wd.amount);
  wd.status = 'CANCELLED';
  await wd.save();

  const hydrated = await Withdrawal.findById(id).populate(WD_POPULATE);
  return hydrated as unknown as IWithdrawal;
}

export async function listMyWithdrawals(user: IUser): Promise<IWithdrawal[]> {
  const docs = await Withdrawal.find({ user: user._id }).sort({ createdAt: -1 }).populate('user');
  return docs as unknown as IWithdrawal[];
}

export async function listAllWithdrawals(status?: string): Promise<IWithdrawal[]> {
  const filter = status ? { status } : {};
  const docs = await Withdrawal.find(filter).sort({ createdAt: -1 }).populate(WD_POPULATE);
  return docs as unknown as IWithdrawal[];
}

export async function approveWithdrawal(id: string, admin: IUser, ip?: string | null): Promise<IWithdrawal> {
  const wd = await Withdrawal.findById(id);
  if (!wd) throw Errors.notFound('Withdrawal not found.');
  if (wd.status !== 'PENDING') throw Errors.badInput('Only pending withdrawals can be approved.');

  wd.status = 'PROCESSING';
  wd.processedBy = admin._id;
  await wd.save();

  await auditService.log({
    action: 'withdrawal_approved',
    actorId: admin._id,
    targetId: wd._id,
    targetType: 'Withdrawal',
    metadata: { reference: wd.reference },
    ip,
  });

  const hydrated = await Withdrawal.findById(id).populate(WD_POPULATE);
  return hydrated as unknown as IWithdrawal;
}

export async function completeWithdrawal(id: string, admin: IUser, ip?: string | null): Promise<IWithdrawal> {
  const wd = await Withdrawal.findById(id);
  if (!wd) throw Errors.notFound('Withdrawal not found.');
  if (wd.status !== 'PROCESSING') throw Errors.badInput('Only processing withdrawals can be completed.');

  await walletService.settleHold(wd.user, wd.amount, {
    type: 'WITHDRAWAL',
    description: `Withdrawal to ${wd.bankName}`,
    reference: wd.reference,
    metadata: { withdrawalId: wd._id.toString() },
  });

  wd.status = 'COMPLETED';
  wd.processedBy = admin._id;
  wd.processedAt = new Date();
  await wd.save();

  await notificationService.notify(
    wd.user,
    'WITHDRAWAL_COMPLETED',
    'Withdrawal completed',
    `Your withdrawal of ₦${wd.amount.toLocaleString()} has been processed.`
  );
  await auditService.log({
    action: 'withdrawal_completed',
    actorId: admin._id,
    targetId: wd._id,
    targetType: 'Withdrawal',
    metadata: { reference: wd.reference },
    ip,
  });

  const hydrated = await Withdrawal.findById(id).populate(WD_POPULATE);
  return hydrated as unknown as IWithdrawal;
}

export async function rejectWithdrawal(id: string, admin: IUser, reason: string, ip?: string | null): Promise<IWithdrawal> {
  const wd = await Withdrawal.findById(id);
  if (!wd) throw Errors.notFound('Withdrawal not found.');
  if (['COMPLETED', 'CANCELLED'].includes(wd.status)) {
    throw Errors.badInput('This withdrawal cannot be rejected.');
  }

  await walletService.release(wd.user, wd.amount);
  wd.status = 'REJECTED';
  wd.rejectionReason = reason?.trim() || null;
  wd.processedBy = admin._id;
  wd.processedAt = new Date();
  await wd.save();

  await notificationService.notify(
    wd.user,
    'WITHDRAWAL_REJECTED',
    'Withdrawal rejected',
    reason?.trim() || 'Your withdrawal was rejected.'
  );
  await auditService.log({
    action: 'withdrawal_rejected',
    actorId: admin._id,
    targetId: wd._id,
    targetType: 'Withdrawal',
    metadata: { reference: wd.reference, reason },
    ip,
  });

  const hydrated = await Withdrawal.findById(id).populate(WD_POPULATE);
  return hydrated as unknown as IWithdrawal;
}
