import { ITradingRate } from '../../models';
import { requireAdmin } from '../../middleware/auth';
import { AppContext } from '../../types/context';
import * as rateService from '../../services/rate.service';

export const rateResolvers = {
  Query: {
    tradingRates: (_: unknown, { brandId }: { brandId?: string }, _ctx: AppContext) => {
      return rateService.listRates(brandId);
    },
  },

  Mutation: {
    updateTradingRate: (
      _: unknown,
      { input }: { input: rateService.UpsertRateInput },
      ctx: AppContext
    ) => {
      const admin = requireAdmin(ctx);
      return rateService.upsertRate(input, admin, ctx.req.ip);
    },
  },

  TradingRate: {
    id: (parent: ITradingRate) => parent._id.toString(),
  },
};
