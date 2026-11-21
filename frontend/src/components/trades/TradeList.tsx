'use client';

import Link from 'next/link';
import { CreditCard, ReceiptText } from 'lucide-react';
import { Trade } from '@/lib/graphql/operations';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { statusMeta, formatMoney, formatDate, formatNumber } from '@/lib/format';
import { cardTypeLabel } from '@/lib/card-types';

function Thumbnail({ trade }: { trade: Trade }) {
  const url = trade.giftCard.image?.url;
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={trade.brand.name} className="h-full w-full object-cover" />
      ) : (
        <CreditCard className="h-5 w-5 text-ink-400" />
      )}
    </div>
  );
}

export function TradeCard({ trade }: { trade: Trade }) {
  const meta = statusMeta(trade.status);
  const payout = trade.payoutAmount ?? trade.estimatedValue;

  return (
    <Link
      href={`/dashboard/trades/${trade.id}`}
      className="glass-card flex items-center gap-4 p-4 transition-colors hover:border-ink-300"
    >
      <Thumbnail trade={trade} />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-ink-900">{trade.brand.name}</span>
          <Badge className={meta.className}>{meta.label}</Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-ink-400">
          {cardTypeLabel(trade.giftCard.cardType)} · {trade.giftCard.country} · {formatDate(trade.createdAt)}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-ink-900">{formatMoney(payout, trade.currency)}</p>
        <p className="text-xs text-ink-400">
          {trade.cardCurrency} {formatNumber(trade.cardValue)}
        </p>
      </div>
    </Link>
  );
}

export function TradeList({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText className="h-6 w-6" />}
        title="No trades yet"
        description="Sell your first gift card to see it appear here."
        action={
          <Link
            href="/dashboard/trade"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Sell a gift card
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {trades.map((trade) => (
        <TradeCard key={trade.id} trade={trade} />
      ))}
    </div>
  );
}
