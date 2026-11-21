import { Schema, model, models, Model, Types } from 'mongoose';

export interface BrandCountry {
  code: string;
  name: string;
}

export interface BrandLogo {
  url: string;
  publicId: string;
}

export interface IGiftCardBrand {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  category: string;
  supportedCountries: BrandCountry[];
  logo?: BrandLogo | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type GiftCardBrandModel = Model<IGiftCardBrand>;

const countrySchema = new Schema<BrandCountry>(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false }
);

const logoSchema = new Schema<BrandLogo>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const giftCardBrandSchema = new Schema<IGiftCardBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: { type: String, required: true, trim: true },
    supportedCountries: { type: [countrySchema], default: [] },
    logo: { type: logoSchema, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const GiftCardBrand: GiftCardBrandModel =
  (models.GiftCardBrand as GiftCardBrandModel) ||
  model<IGiftCardBrand, GiftCardBrandModel>('GiftCardBrand', giftCardBrandSchema);
