import { Media, IMedia } from '../../models';
import { requireAuth } from '../../middleware/auth';
import { AppContext } from '../../types/context';

export const mediaResolvers = {
  Query: {
    media: async (_: unknown, { id }: { id: string }, ctx: AppContext) => {
      requireAuth(ctx);
      return Media.findById(id);
    },
  },

  Media: {
    id: (parent: IMedia) => parent._id.toString(),
  },
};
