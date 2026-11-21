import { TradeStatus } from './graphql/operations';

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatMoney(amount: number, currency = 'NGN'): string {
  if (currency === 'NGN') return formatNaira(amount);
  return `${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export function formatNumber(amount: number): string {
  return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface StatusMeta {
  label: string;
  className: string;
}

export function statusMeta(status: TradeStatus): StatusMeta {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'UNDER_REVIEW':
      return { label: 'Under review', className: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'APPROVED':
      return { label: 'Approved', className: 'bg-brand-50 text-brand-700 border-brand-200' };
    case 'COMPLETED':
      return { label: 'Completed', className: 'bg-brand-50 text-brand-700 border-brand-200' };
    case 'REJECTED':
      return { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' };
    case 'CANCELLED':
      return { label: 'Cancelled', className: 'bg-slate-100 text-ink-500 border-slate-200' };
  }
}

import {
  TransactionType,
  WithdrawalStatus,
  KycStatus,
  TrustTier,
} from './graphql/operations';

const TX_LABELS: Record<TransactionType, string> = {
  TRADE_CREDIT: 'Trade credit',
  WITHDRAWAL: 'Withdrawal',
  REFUND: 'Refund',
  ADJUSTMENT: 'Adjustment',
  BONUS: 'Bonus',
  FEE: 'Fee',
};

export function transactionTypeLabel(type: TransactionType): string {
  return TX_LABELS[type] ?? type;
}

export function withdrawalStatusMeta(status: WithdrawalStatus): StatusMeta {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'PROCESSING':
      return { label: 'Processing', className: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'COMPLETED':
      return { label: 'Completed', className: 'bg-brand-50 text-brand-700 border-brand-200' };
    case 'REJECTED':
      return { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' };
    case 'CANCELLED':
      return { label: 'Cancelled', className: 'bg-slate-100 text-ink-500 border-slate-200' };
  }
}

export function kycStatusMeta(status: KycStatus): StatusMeta {
  switch (status) {
    case 'PENDING':
      return { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'UNDER_REVIEW':
      return { label: 'Under review', className: 'bg-sky-50 text-sky-700 border-sky-200' };
    case 'APPROVED':
      return { label: 'Approved', className: 'bg-brand-50 text-brand-700 border-brand-200' };
    case 'REJECTED':
      return { label: 'Rejected', className: 'bg-red-50 text-red-700 border-red-200' };
  }
}

export function trustTierLabel(tier: TrustTier): string {
  return tier.replace('_', ' ');
}

export function documentTypeLabel(type: string): string {
  return type
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}
