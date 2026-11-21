import { Schema, model, models, Model, Types } from 'mongoose';

export type ResourceType = 'image' | 'video' | 'raw';

export interface IMedia {
  _id: Types.ObjectId;
  url: string;
  publicId: string;
  resourceType: ResourceType;
  width?: number | null;
  height?: number | null;
  folder: string;
  owner: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

type MediaModel = Model<IMedia>;

const mediaSchema = new Schema<IMedia>(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    resourceType: {
      type: String,
      enum: ['image', 'video', 'raw'],
      default: 'image',
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    folder: {
      type: String,
      default: '',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Media: MediaModel =
  (models.Media as MediaModel) || model<IMedia, MediaModel>('Media', mediaSchema);
