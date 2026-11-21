import { IWithdrawal } from '../../models';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { AppContext } from '../../types/context';
import * as withdrawalService from '../../services/withdrawal.service';

export const withdrawalResolvers = {
  Query: {
    withdrawals: (_: unknown, __: unknown, ctx: AppContext) => {
      const user = requireAuth(ctx);
      return withdrawalService.listMyWithdrawals(user);
    },
    allWithdrawals: (_: unknown, { status }: { status?: string }, ctx: AppContext) => {
      requireAdmin(ctx);
      return withdrawalService.listAllWithdrawals(status);
    },
  },

  Mutation: {
    requestWithdrawal: (
      _: unknown,
      { input }: { input: withdrawalService.RequestWithdrawalInput },
      ctx: AppContext
    ) => {
      const user = requireAuth(ctx);
      return withdrawalService.requestWithdrawal(user, input, ctx.req.ip);
    },
    cancelWithdrawal: (_: unknown, { id }: { id: string }, ctx: AppContext) => {
      const user = requireAuth(ctx);
      return withdrawalService.cancelWithdrawal(user, id);
    },
    approveWithdrawal: (_: unknown, { id }: { id: string }, ctx: AppContext) => {
      const admin = requireAdmin(ctx);
      return withdrawalService.approveWithdrawal(id, admin, ctx.req.ip);
    },
    completeWithdrawal: (_: unknown, { id }: { id: string }, ctx: AppContext) => {
      const admin = requireAdmin(ctx);
      return withdrawalService.completeWithdrawal(id, admin, ctx.req.ip);
    },
    rejectWithdrawal: (
      _: unknown,
      { id, reason }: { id: string; reason: string },
      ctx: AppContext
    ) => {
      const admin = requireAdmin(ctx);
      return withdrawalService.rejectWithdrawal(id, admin, reason, ctx.req.ip);
    },
  },

  Withdrawal: {
    id: (parent: IWithdrawal) => parent._id.toString(),
  },
};
