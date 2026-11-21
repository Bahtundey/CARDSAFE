import { Notification, INotification } from '../models';
import { Types } from 'mongoose';

export async function notify(
  userId: Types.ObjectId,
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown> | null
): Promise<INotification> {
  return Notification.create({
    user: userId,
    type,
    title,
    message,
    data: data ?? null,
  });
}

export async function listNotifications(userId: Types.ObjectId, limit = 20): Promise<INotification[]> {
  return Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(limit);
}

export async function unreadCount(userId: Types.ObjectId): Promise<number> {
  return Notification.countDocuments({ user: userId, read: false });
}

export async function markRead(userId: Types.ObjectId, id: string): Promise<INotification | null> {
  return Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { $set: { read: true } },
    { new: true }
  );
}

export async function markAllRead(userId: Types.ObjectId): Promise<void> {
  await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
}
