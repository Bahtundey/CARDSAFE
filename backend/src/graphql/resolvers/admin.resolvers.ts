import { IAuditLog, Transaction } from '../../models';
import { requireAdmin } from '../../middleware/auth';
import { AppContext } from '../../types/context';
import * as adminService from '../../services/admin.service';
import * as auditService from '../../services/audit.service';

export const adminResolvers = {
  Query: {
    adminDashboardStats: (_: unknown, __: unknown, ctx: AppContext) => {
      requireAdmin(ctx);
      return adminService.getDashboardStats();
    },
    allUsers: (_: unknown, { search }: { search?: string }, ctx: AppContext) => {
      requireAdmin(ctx);
      return adminService.listAllUsers(search);
    },
    allTransactions: async (
      _: unknown,
      { limit, offset }: { limit?: number; offset?: number },
      ctx: AppContext
    ) => {
      requireAdmin(ctx);
      return Transaction.find()
        .sort({ createdAt: -1 })
        .skip(offset ?? 0)
        .limit(limit ?? 50)
        .populate('user')
        .populate('trade');
    },
    auditLogs: (_: unknown, { limit }: { limit?: number }, ctx: AppContext) => {
      requireAdmin(ctx);
      return auditService.listLogs({ limit: limit ?? 100 });
    },
  },

  Mutation: {
    suspendUser: (_: unknown, { id }: { id: string }, ctx: AppContext) => {
      const admin = requireAdmin(ctx);
      return adminService.suspendUser(id, admin, ctx.req.ip);
    },
    activateUser: (_: unknown, { id }: { id: string }, ctx: AppContext) => {
      const admin = requireAdmin(ctx);
      return adminService.activateUser(id, admin, ctx.req.ip);
    },
    adjustWallet: (
      _: unknown,
      { userId, amount, reason }: { userId: string; amount: number; reason?: string },
      ctx: AppContext
    ) => {
      const admin = requireAdmin(ctx);
      return adminService.adjustWallet(userId, amount, reason ?? '', admin, ctx.req.ip);
    },
  },

  AuditLog: {
    id: (parent: IAuditLog) => parent._id.toString(),
    metadata: (parent: IAuditLog) => (parent.metadata ? JSON.stringify(parent.metadata) : null),
  },
};
