import { DateTimeScalar } from './scalars';
import { authResolvers } from './auth.resolvers';
import { userResolvers } from './user.resolvers';
import { mediaResolvers } from './media.resolvers';
import { brandResolvers } from './brand.resolvers';
import { rateResolvers } from './rate.resolvers';
import { tradeResolvers } from './trade.resolvers';
import { walletResolvers } from './wallet.resolvers';
import { withdrawalResolvers } from './withdrawal.resolvers';
import { kycResolvers } from './kyc.resolvers';
import { notificationResolvers } from './notification.resolvers';
import { adminResolvers } from './admin.resolvers';

export const resolvers = {
  DateTime: DateTimeScalar,

  Query: {
    ...userResolvers.Query,
    ...mediaResolvers.Query,
    ...brandResolvers.Query,
    ...rateResolvers.Query,
    ...tradeResolvers.Query,
    ...walletResolvers.Query,
    ...withdrawalResolvers.Query,
    ...kycResolvers.Query,
    ...notificationResolvers.Query,
    ...adminResolvers.Query,
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...brandResolvers.Mutation,
    ...rateResolvers.Mutation,
    ...tradeResolvers.Mutation,
    ...withdrawalResolvers.Mutation,
    ...kycResolvers.Mutation,
    ...notificationResolvers.Mutation,
    ...adminResolvers.Mutation,
  },

  User: userResolvers.User,
  Media: mediaResolvers.Media,
  GiftCardBrand: brandResolvers.GiftCardBrand,
  TradingRate: rateResolvers.TradingRate,
  Trade: tradeResolvers.Trade,
  GiftCard: tradeResolvers.GiftCard,
  Wallet: walletResolvers.Wallet,
  Transaction: walletResolvers.Transaction,
  Withdrawal: withdrawalResolvers.Withdrawal,
  KycStatusInfo: kycResolvers.KycStatusInfo,
  KycRecord: kycResolvers.KycRecord,
  AppNotification: notificationResolvers.AppNotification,
  AuditLog: adminResolvers.AuditLog,
};
