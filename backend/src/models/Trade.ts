import { Schema, model, models, Model, Types } from 'mongoose';
import { TradeStatus, TRADE_STATUSES } from '../constants/trade';

export interface ITrade {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  giftCard: Types.ObjectId;
  brand: Types.ObjectId;
  rate: Types.ObjectId | null;
  status: TradeStatus;
  cardValue: number;
  cardCurrency: string;
  estimatedValue: number;
  payoutAmount: number | null;
  currency: string;
  reviewNote?: string | null;
  reviewedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

type TradeModel = Model<ITrade>;

const tradeSchema = new Schema<ITrade>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    giftCard: { type: Schema.Types.ObjectId, ref: 'GiftCard', required: true },
    brand: { type: Schema.Types.ObjectId, ref: 'GiftCardBrand', required: true, index: true },
    rate: { type: Schema.Types.ObjectId, ref: 'TradingRate', default: null },
    status: {
      type: String,
      enum: TRADE_STATUSES,
      default: 'PENDING',
      required: true,
      index: true,
    },
    cardValue: { type: Number, required: true, min: 0 },
    cardCurrency: { type: String, required: true, uppercase: true },
    estimatedValue: { type: Number, required: true, min: 0 },
    payoutAmount: { type: Number, default: null },
    currency: { type: String, required: true, uppercase: true },
    reviewNote: { type: String, default: null, maxlength: 500 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

export const Trade: TradeModel =
  (models.Trade as TradeModel) || model<ITrade, TradeModel>('Trade', tradeSchema);
