import { ITrade, IGiftCard } from '../../models';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import { AppContext } from '../../types/context';
import * as tradingService from '../../services/trading.service';
import { uploadMediaFromBase64 } from '../../services/media.service';

export const tradeResolvers = {
  Query: {
    myTrades: (_: unknown, __: unknown, ctx: AppContext) => {
      const user = requireAuth(ctx);
      return tradingService.getMyTrades(user);
    },
    trade: (_: unknown, { id }: { id: string }, ctx: AppContext) => {
      const user = requireAuth(ctx);
      return tradingService.getTradeById(id, user);
    },
    tradeEstimate: (
      _: unknown,
      { input }: { input: tradingService.EstimateInput },
      ctx: AppContext
    ) => {
      requireAuth(ctx);
      return tradingService.estimate(input);
    },
    allTrades: (_: unknown, __: unknown, ctx: AppContext) => {
      requireAdmin(ctx);
      return tradingService.listAllTrades();
    },
  },

  Mutation: {
    uploadGiftCardImage: (
      _: unknown,
      { base64Image, folder }: { base64Image: string; folder?: string },
      ctx: AppContext
    ) => {
      const user = requireAuth(ctx);
      return uploadMediaFromBase64(base64Image, folder ?? 'gift-cards', user);
    },
    createTrade: (
      _: unknown,
      { input }: { input: tradingService.SubmitTradeInput },
      ctx: AppContext
    ) => {
      const user = requireAuth(ctx);
      return tradingService.createTrade(input, user);
    },
    cancelTrade: (_: unknown, { id }: { id: string }, ctx: AppContext) => {
      const user = requireAuth(ctx);
      return tradingService.cancelTrade(id, user);
    },
    approveTrade: (_: unknown, { id }: { id: string }, ctx: AppContext) => {
      const admin = requireAdmin(ctx);
      return tradingService.approveTrade(id, admin, ctx.req.ip);
    },
    rejectTrade: (
      _: unknown,
      { id, reason }: { id: string; reason: string },
      ctx: AppContext
    ) => {
      const admin = requireAdmin(ctx);
      return tradingService.rejectTrade(id, admin, reason, ctx.req.ip);
    },
    revealGiftCardCode: (
      _: unknown,
      { giftCardId }: { giftCardId: string },
      ctx: AppContext
    ) => {
      const admin = requireAdmin(ctx);
      return tradingService.revealGiftCardCode(giftCardId, admin, ctx.req.ip);
    },
  },

  Trade: {
    id: (parent: ITrade) => parent._id.toString(),
  },

  GiftCard: {
    id: (parent: IGiftCard) => parent._id.toString(),
    codeMask: (parent: IGiftCard) => parent.codeMask ?? null,
    hasCode: (parent: IGiftCard) => Boolean(parent.codeMask),
  },
};
