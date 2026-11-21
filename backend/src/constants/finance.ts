export const TRANSACTION_TYPES = [
  'TRADE_CREDIT',
  'WITHDRAWAL',
  'REFUND',
  'ADJUSTMENT',
  'BONUS',
  'FEE',
] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = ['COMPLETED', 'PENDING', 'FAILED'] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const WITHDRAWAL_STATUSES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'REJECTED',
  'CANCELLED',
] as const;
export type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number];

export const KYC_STATUSES = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const;
export type KycStatus = (typeof KYC_STATUSES)[number];

export const DOCUMENT_TYPES = [
  'NATIONAL_ID',
  'PASSPORT',
  'DRIVERS_LICENSE',
  'VOTERS_CARD',
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const MIN_WITHDRAWAL = 1000; // NGN
export const DEFAULT_PAYOUT_CURRENCY = 'NGN';
