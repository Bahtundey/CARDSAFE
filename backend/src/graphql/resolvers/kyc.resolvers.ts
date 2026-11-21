import { IKYC } from '../../models';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { AppContext } from '../../types/context';
import * as kycService from '../../services/kyc.service';

export const kycResolvers = {
  Query: {
    kycStatus: (_: unknown, __: unknown, ctx: AppContext) => {
      const user = requireAuth(ctx);
      return kycService.getKycStatus(user);
    },
    allKyc: (_: unknown, { status }: { status?: string }, ctx: AppContext) => {
      requireAdmin(ctx);
      return kycService.listAllKyc(status);
    },
  },

  Mutation: {
    submitKYC: (_: unknown, { input }: { input: kycService.SubmitKycInput }, ctx: AppContext) => {
      const user = requireAuth(ctx);
      return kycService.submitKYC(user, input, ctx.req.ip);
    },
    approveKYC: (_: unknown, { id }: { id: string }, ctx: AppContext) => {
      const admin = requireAdmin(ctx);
      return kycService.approveKYC(id, admin, ctx.req.ip);
    },
    rejectKYC: (
      _: unknown,
      { id, reason }: { id: string; reason: string },
      ctx: AppContext
    ) => {
      const admin = requireAdmin(ctx);
      return kycService.rejectKYC(id, admin, reason, ctx.req.ip);
    },
  },

  KycStatusInfo: {
    id: (parent: IKYC) => parent._id.toString(),
  },

  KycRecord: {
    id: (parent: IKYC) => parent._id.toString(),
  },
};
