import { Schema, model, models, Model, Types } from 'mongoose';
import { KycStatus, KYC_STATUSES, DocumentType, DOCUMENT_TYPES } from '../constants/finance';

export interface KycImage {
  url: string;
  publicId: string;
}

export interface IKYC {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  documentType: DocumentType;
  documentImage: KycImage;
  selfieImage?: KycImage | null;
  status: KycStatus;
  rejectionReason?: string | null;
  reviewedBy?: Types.ObjectId | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type KycModel = Model<IKYC>;

const imageSchema = new Schema<KycImage>(
  { url: { type: String, required: true }, publicId: { type: String, required: true } },
  { _id: false }
);

const kycSchema = new Schema<IKYC>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    documentType: { type: String, enum: DOCUMENT_TYPES, required: true },
    documentImage: { type: imageSchema, required: true },
    selfieImage: { type: imageSchema, default: null },
    status: { type: String, enum: KYC_STATUSES, default: 'PENDING', index: true },
    rejectionReason: { type: String, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const KYC: KycModel =
  (models.KYC as KycModel) || model<IKYC, KycModel>('KYC', kycSchema);
