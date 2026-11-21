export const TRADE_STATUSES = [
  'PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
] as const;

export type TradeStatus = (typeof TRADE_STATUSES)[number];

export const TRANSACTION_TYPES = ['CREDIT', 'DEBIT'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const DEFAULT_PAYOUT_CURRENCY = 'NGN';
export const DEFAULT_CARD_CURRENCY = 'USD';

// Two distinct trading-rate categories. E_CODE rates must always be lower than
// the matching PHYSICAL rate for the same (brand, country, cardCurrency).
export const CARD_TYPES = ['PHYSICAL', 'E_CODE'] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  PHYSICAL: 'Physical Card',
  E_CODE: 'E-code',
};

/**
 * Normalize a client-supplied card type into the canonical enum value.
 * Accepts the legacy spellings ("Physical", "E-code", "ECode", ...) so that
 * stale UI strings or old documents still resolve correctly. Returns null when
 * the value cannot be mapped.
 */
export function normalizeCardType(value: string | null | undefined): CardType | null {
  const v = value?.trim().toLowerCase() ?? '';
  if (v === 'physical') return 'PHYSICAL';
  if (v === 'e-code' || v === 'ecode' || v === 'e_code') return 'E_CODE';
  return null;
}

export function isCardType(value: string | null | undefined): value is CardType {
  return normalizeCardType(value) !== null;
}
