import { IWallet, ITransaction } from '../../models';
import { requireAuth } from '../../middleware/auth';
import { AppContext } from '../../types/context';
import * as walletService from '../../services/wallet.service';
import * as trustService from '../../services/trust.service';

export const walletResolvers = {
  Query: {
    wallet: (_: unknown, __: unknown, ctx: AppContext) => {
      const user = requireAuth(ctx);
      return walletService.getBalance(user._id);
    },
    transactions: (
      _: unknown,
      { limit, offset }: { limit?: number; offset?: number },
      ctx: AppContext
    ) => {
      const user = requireAuth(ctx);
      return walletService.listTransactions(user._id, limit ?? 20, offset ?? 0);
    },
    myTrustTier: (_: unknown, __: unknown, ctx: AppContext) => {
      const user = requireAuth(ctx);
      return trustService.getTrustLimits(user._id);
    },
  },

  Wallet: {
    id: (parent: IWallet) => parent._id.toString(),
  },

  Transaction: {
    id: (parent: ITransaction) => parent._id.toString(),
  },
};
