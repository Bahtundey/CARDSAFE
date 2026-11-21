import { Schema, model, models, Model, Types } from 'mongoose';
import { TransactionType, TRANSACTION_TYPES, TransactionStatus, TRANSACTION_STATUSES } from '../constants/finance';

export interface ITransaction {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: TransactionType;
  amount: number; // signed: credits positive, debits negative
  currency: string;
  reference: string;
  status: TransactionStatus;
  description: string;
  balanceBefore: number;
  balanceAfter: number;
  trade?: Types.ObjectId | null;
  metadata?: Record<string, unknown> | null;
  createdAt: Date;
}

type TransactionModel = Model<ITransaction>;

const transactionSchema = new Schema<ITransaction>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: TRANSACTION_TYPES, required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, uppercase: true },
    reference: { type: String, required: true, index: true },
    status: { type: String, enum: TRANSACTION_STATUSES, default: 'COMPLETED' },
    description: { type: String, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    trade: { type: Schema.Types.ObjectId, ref: 'Trade', default: null },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Transaction: TransactionModel =
  (models.Transaction as TransactionModel) ||
  model<ITransaction, TransactionModel>('Transaction', transactionSchema);
