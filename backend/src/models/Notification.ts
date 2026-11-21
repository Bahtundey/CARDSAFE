import { Schema, model, models, Model, Types } from 'mongoose';

export interface INotification {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown> | null;
  createdAt: Date;
}

type NotificationModel = Model<INotification>;

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    data: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification: NotificationModel =
  (models.Notification as NotificationModel) ||
  model<INotification, NotificationModel>('Notification', notificationSchema);
