export const TRUST_TIERS = ['TIER_1', 'TIER_2', 'TIER_3'] as const;
export type TrustTier = (typeof TRUST_TIERS)[number];

export interface TierLimits {
  tier: TrustTier;
  minWithdrawal: number;
  maxWithdrawalPerRequest: number;
  maxWithdrawalPerDay: number;
  maxBalance: number;
}

// Tier limits are defined in backend logic only — the frontend can never choose
// a tier, and never sees the raw thresholds unless it asks for its own tier.
const LIMITS: Record<TrustTier, Omit<TierLimits, 'tier'>> = {
  TIER_1: {
    minWithdrawal: 1000,
    maxWithdrawalPerRequest: 50000,
    maxWithdrawalPerDay: 100000,
    maxBalance: 500000,
  },
  TIER_2: {
    minWithdrawal: 1000,
    maxWithdrawalPerRequest: 500000,
    maxWithdrawalPerDay: 1000000,
    maxBalance: 5000000,
  },
  TIER_3: {
    minWithdrawal: 1000,
    maxWithdrawalPerRequest: 5000000,
    maxWithdrawalPerDay: 10000000,
    maxBalance: 100000000,
  },
};

export function getTierLimits(tier: TrustTier): TierLimits {
  return { tier, ...LIMITS[tier] };
}
