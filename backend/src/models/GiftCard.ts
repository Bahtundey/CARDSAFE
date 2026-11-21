import { Schema, model, models, Model, Types } from 'mongoose';

export interface GiftCardImage {
  url: string;
  publicId: string;
}

export interface IGiftCard {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  brand: Types.ObjectId;
  country: string;
  cardType: string;
  value: number;
  currency: string;
  image?: GiftCardImage | null;
  notes?: string | null;
  codeCipher?: string | null;
  codeMask?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type GiftCardModel = Model<IGiftCard>;

const imageSchema = new Schema<GiftCardImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const giftCardSchema = new Schema<IGiftCard>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    brand: { type: Schema.Types.ObjectId, ref: 'GiftCardBrand', required: true },
    country: { type: String, required: true },
    cardType: { type: String, required: true, trim: true },
    value: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, uppercase: true },
    image: { type: imageSchema, default: null },
    notes: { type: String, default: null, maxlength: 500 },
    // E-codes are stored encrypted at rest. `codeCipher` is hidden from all
    // default queries; `codeMask` (last-4 mask) is the only code-derived value
    // ever returned through general queries.
    codeCipher: { type: String, select: false, default: null },
    codeMask: { type: String, default: null },
  },
  { timestamps: true }
);

export const GiftCard: GiftCardModel =
  (models.GiftCard as GiftCardModel) || model<IGiftCard, GiftCardModel>('GiftCard', giftCardSchema);
