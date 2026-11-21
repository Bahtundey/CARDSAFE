import { Media, IUser } from '../../models';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { AppContext } from '../../types/context';
import { listUsers } from '../../services/user.service';

export const userResolvers = {
  Query: {
    me: (_: unknown, __: unknown, ctx: AppContext) => requireAuth(ctx),
    users: async (
      _: unknown,
      { limit, offset }: { limit: number; offset: number },
      ctx: AppContext
    ) => {
      requireAdmin(ctx);
      return listUsers({ limit, offset });
    },
  },

  User: {
    id: (parent: IUser) => parent._id.toString(),
    avatar: async (parent: IUser) => {
      if (!parent.avatar) return null;
      return Media.findById(parent.avatar);
    },
  },
};
