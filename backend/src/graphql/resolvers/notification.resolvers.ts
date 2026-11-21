import { INotification } from '../../models';
import { requireAuth } from '../../middleware/auth';
import { AppContext } from '../../types/context';
import * as notificationService from '../../services/notification.service';

export const notificationResolvers = {
  Query: {
    notifications: (_: unknown, { limit }: { limit?: number }, ctx: AppContext) => {
      const user = requireAuth(ctx);
      return notificationService.listNotifications(user._id, limit ?? 30);
    },
    unreadNotificationsCount: (_: unknown, __: unknown, ctx: AppContext) => {
      const user = requireAuth(ctx);
      return notificationService.unreadCount(user._id);
    },
  },

  Mutation: {
    markNotificationRead: (_: unknown, { id }: { id: string }, ctx: AppContext) => {
      const user = requireAuth(ctx);
      return notificationService.markRead(user._id, id);
    },
    markAllNotificationsRead: async (_: unknown, __: unknown, ctx: AppContext) => {
      const user = requireAuth(ctx);
      await notificationService.markAllRead(user._id);
      return true;
    },
  },

  AppNotification: {
    id: (parent: INotification) => parent._id.toString(),
  },
};
