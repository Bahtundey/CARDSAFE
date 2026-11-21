import { Schema, model, models, Model, Types } from 'mongoose';

export interface ITradingRate {
  _id: Types.ObjectId;
  brand: Types.ObjectId;
  country: string;
  cardType: string;
  cardCurrency: string;
  currency: string;
  rate: number;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type TradingRateModel = Model<ITradingRate>;

const tradingRateSchema = new Schema<ITradingRate>(
  {
    brand: { type: Schema.Types.ObjectId, ref: 'GiftCardBrand', required: true, index: true },
    country: { type: String, required: true, index: true },
    cardType: { type: String, required: true, enum: ['PHYSICAL', 'E_CODE'], trim: true },
    cardCurrency: { type: String, required: true, uppercase: true, default: 'USD' },
    currency: { type: String, required: true, uppercase: true, default: 'NGN' },
    rate: { type: Number, required: true, min: 0 },
    minAmount: { type: Number, required: true, min: 0 },
    maxAmount: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// A rate is unique per (brand, country, cardType, cardCurrency).
tradingRateSchema.index(
  { brand: 1, country: 1, cardType: 1, cardCurrency: 1 },
  { unique: true }
);

export const TradingRate: TradingRateModel =
  (models.TradingRate as TradingRateModel) ||
  model<ITradingRate, TradingRateModel>('TradingRate', tradingRateSchema);
