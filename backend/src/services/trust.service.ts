import { KYC } from '../models';
import { TrustTier, getTierLimits, TierLimits } from '../constants/trust';
import { Types } from 'mongoose';

/**
 * Trust tier is computed exclusively on the backend from a user's KYC status.
 * The frontend can never choose its own tier.
 */
export async function getTrustTier(userId: Types.ObjectId): Promise<TrustTier> {
  const kyc = await KYC.findOne({ user: userId, status: 'APPROVED' });
  if (kyc?.selfieImage) return 'TIER_3';
  if (kyc) return 'TIER_2';
  return 'TIER_1';
}

export async function getTrustLimits(userId: Types.ObjectId): Promise<TierLimits> {
  const tier = await getTrustTier(userId);
  return getTierLimits(tier);
}
