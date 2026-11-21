import { Schema, model, models, Model, Types } from 'mongoose';

export interface IWallet {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

type WalletModel = Model<IWallet>;

const walletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    balance: { type: Number, default: 0, min: 0 },
    availableBalance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    currency: { type: String, required: true, uppercase: true, default: 'NGN' },
  },
  { timestamps: true }
);

export const Wallet: WalletModel =
  (models.Wallet as WalletModel) || model<IWallet, WalletModel>('Wallet', walletSchema);
