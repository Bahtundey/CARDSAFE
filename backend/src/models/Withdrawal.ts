import { Schema, model, models, Model, Types } from 'mongoose';
import { WithdrawalStatus, WITHDRAWAL_STATUSES } from '../constants/finance';

export interface IWithdrawal {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  currency: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  status: WithdrawalStatus;
  reference: string;
  rejectionReason?: string | null;
  processedBy?: Types.ObjectId | null;
  processedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type WithdrawalModel = Model<IWithdrawal>;

const withdrawalSchema = new Schema<IWithdrawal>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true, default: 'NGN' },
    bankName: { type: String, required: true, trim: true },
    accountName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    status: { type: String, enum: WITHDRAWAL_STATUSES, default: 'PENDING', index: true },
    reference: { type: String, required: true, unique: true },
    rejectionReason: { type: String, default: null },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Withdrawal: WithdrawalModel =
  (models.Withdrawal as WithdrawalModel) ||
  model<IWithdrawal, WithdrawalModel>('Withdrawal', withdrawalSchema);
