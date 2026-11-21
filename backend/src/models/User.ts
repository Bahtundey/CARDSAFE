import { Schema, model, models, Model, Types } from 'mongoose';
import { Role } from '../constants/roles';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  isActive: boolean;
  isVerified: boolean;
  avatar?: Types.ObjectId | null;
  tokenVersion: number;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type UserModel = Model<IUser>;

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: Schema.Types.ObjectId,
      ref: 'Media',
      default: null,
    },
    // Incremented to revoke outstanding refresh tokens (logout / password change).
    tokenVersion: {
      type: Number,
      default: 0,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// `passwordHash` is hidden by default; expose it only where explicitly needed.
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User: UserModel =
  (models.User as UserModel) || model<IUser, UserModel>('User', userSchema);
