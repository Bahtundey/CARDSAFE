import { HydratedDocument, Types } from 'mongoose';
import { Wallet, Transaction, IWallet, ITransaction } from '../models';
import { TransactionType } from '../constants/finance';
import { DEFAULT_PAYOUT_CURRENCY } from '../constants/finance';
import { round2 } from '../utils/money';
import { generateReference } from '../utils/ref';
import { Errors } from '../utils/errors';

export interface LedgerEntry {
  type: TransactionType;
  description: string;
  reference?: string;
  tradeId?: Types.ObjectId | null;
  metadata?: Record<string, unknown> | null;
}

export interface BalanceChange {
  wallet: HydratedDocument<IWallet>;
  transaction: ITransaction;
}

export async function getOrCreateWallet(userId: Types.ObjectId): Promise<HydratedDocument<IWallet>> {
  const existing = await Wallet.findOne({ user: userId });
  if (existing) return existing;

  return Wallet.create({
    user: userId,
    balance: 0,
    availableBalance: 0,
    pendingBalance: 0,
    currency: DEFAULT_PAYOUT_CURRENCY,
  });
}

export async function getBalance(userId: Types.ObjectId): Promise<IWallet> {
  return getOrCreateWallet(userId);
}

/** Credit (money in). Always creates a ledger transaction. */
export async function credit(
  userId: Types.ObjectId,
  amount: number,
  entry: LedgerEntry
): Promise<BalanceChange> {
  const amt = round2(Math.abs(amount));
  const wallet = await getOrCreateWallet(userId);
  const balanceBefore = wallet.balance;

  wallet.balance = round2(wallet.balance + amt);
  wallet.availableBalance = round2(wallet.availableBalance + amt);
  await wallet.save();

  const transaction = await Transaction.create({
    user: userId,
    type: entry.type,
    amount: amt,
    currency: wallet.currency,
    reference: entry.reference ?? generateReference('TXN'),
    status: 'COMPLETED',
    description: entry.description,
    balanceBefore,
    balanceAfter: wallet.balance,
    trade: entry.tradeId ?? null,
    metadata: entry.metadata ?? null,
  });

  return { wallet, transaction };
}

/** Debit (money out) from the available balance. Always creates a ledger transaction. */
export async function debit(
  userId: Types.ObjectId,
  amount: number,
  entry: LedgerEntry
): Promise<BalanceChange> {
  const amt = round2(Math.abs(amount));
  const wallet = await getOrCreateWallet(userId);

  if (wallet.availableBalance < amt) {
    throw Errors.badInput('Insufficient available balance.');
  }

  const balanceBefore = wallet.balance;
  wallet.availableBalance = round2(wallet.availableBalance - amt);
  wallet.balance = round2(wallet.balance - amt);
  await wallet.save();

  const transaction = await Transaction.create({
    user: userId,
    type: entry.type,
    amount: -amt,
    currency: wallet.currency,
    reference: entry.reference ?? generateReference('TXN'),
    status: 'COMPLETED',
    description: entry.description,
    balanceBefore,
    balanceAfter: wallet.balance,
    metadata: entry.metadata ?? null,
  });

  return { wallet, transaction };
}

/** Move funds from available → pending (e.g. a withdrawal request). */
export async function hold(userId: Types.ObjectId, amount: number): Promise<HydratedDocument<IWallet>> {
  const amt = round2(Math.abs(amount));
  const wallet = await getOrCreateWallet(userId);

  if (wallet.availableBalance < amt) {
    throw Errors.badInput('Insufficient available balance.');
  }

  wallet.availableBalance = round2(wallet.availableBalance - amt);
  wallet.pendingBalance = round2(wallet.pendingBalance + amt);
  await wallet.save();
  return wallet;
}

/** Move funds from pending → available (e.g. a cancelled/rejected withdrawal). */
export async function release(userId: Types.ObjectId, amount: number): Promise<HydratedDocument<IWallet>> {
  const amt = round2(Math.abs(amount));
  const wallet = await getOrCreateWallet(userId);

  wallet.pendingBalance = round2(Math.max(0, wallet.pendingBalance - amt));
  wallet.availableBalance = round2(wallet.availableBalance + amt);
  await wallet.save();
  return wallet;
}

/** Settle a hold: money leaves the system. pending → 0 and total balance decreases. */
export async function settleHold(
  userId: Types.ObjectId,
  amount: number,
  entry: LedgerEntry
): Promise<BalanceChange> {
  const amt = round2(Math.abs(amount));
  const wallet = await getOrCreateWallet(userId);
  const balanceBefore = wallet.balance;

  wallet.pendingBalance = round2(Math.max(0, wallet.pendingBalance - amt));
  wallet.balance = round2(wallet.balance - amt);
  await wallet.save();

  const transaction = await Transaction.create({
    user: userId,
    type: entry.type,
    amount: -amt,
    currency: wallet.currency,
    reference: entry.reference ?? generateReference('TXN'),
    status: 'COMPLETED',
    description: entry.description,
    balanceBefore,
    balanceAfter: wallet.balance,
    metadata: entry.metadata ?? null,
  });

  return { wallet, transaction };
}

export async function listTransactions(
  userId: Types.ObjectId,
  limit = 20,
  offset = 0
): Promise<ITransaction[]> {
  const docs = await Transaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate('trade');
  return docs as unknown as ITransaction[];
}
