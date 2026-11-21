'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation } from '@apollo/client';
import { ArrowLeft, CreditCard, ReceiptText } from 'lucide-react';
import { TRADE, CANCEL_TRADE, Trade } from '@/lib/graphql/operations';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { statusMeta, formatMoney, formatNumber, formatDateTime } from '@/lib/format';
import { cardTypeLabel } from '@/lib/card-types';
import { extractErrorMessage } from '@/lib/errors';
import { useState } from 'react';

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-ink-500">{label}</span>
      <span className="text-sm font-medium text-ink-700">{value}</span>
    </div>
  );
}

export default function TradeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { data, loading } = useQuery<{ trade: Trade | null }>(TRADE, {
    variables: { id: params.id },
    skip: !params.id,
  });
  const [cancelTrade, { loading: cancelling }] = useMutation<{ cancelTrade: Trade }>(CANCEL_TRADE, {
    refetchQueries: ['Trade', 'MyTrades'],
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const trade = data?.trade;
  if (!trade) {
    return (
      <div className="glass-card p-10 text-center">
        <p className="text-ink-600">Trade not found.</p>
        <Link href="/dashboard/trades" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
          Back to trades
        </Link>
      </div>
    );
  }

  const meta = statusMeta(trade.status);
  const isOwner = user?.id === trade.user?.id || user?.role === 'ADMIN';
  const canCancel = trade.status === 'PENDING' && user?.id === trade.user?.id;

  async function onCancel() {
    setError(null);
    try {
      await cancelTrade({ variables: { id: trade!.id } });
      router.refresh();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/trades" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
        <ArrowLeft className="h-4 w-4" /> Back to trades
      </Link>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ink-50 font-bold text-brand-700">
            {trade.brand.logo?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={trade.brand.logo.url} alt={trade.brand.name} className="h-full w-full rounded-xl object-cover" />
            ) : (
              trade.brand.name.charAt(0)
            )}
          </span>
          <div>
            <h1 className="text-xl font-bold text-ink-900">{trade.brand.name}</h1>
            <p className="text-xs text-ink-400">Trade ID: {trade.id}</p>
          </div>
        </div>
        <Badge className={meta.className}>{meta.label}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card image + details */}
        <section className="glass-card p-6">
          <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-50">
            {trade.giftCard.image?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={trade.giftCard.image.url} alt="Gift card" className="h-64 w-full object-cover" />
            ) : (
              <div className="flex h-64 items-center justify-center text-ink-400">
                <CreditCard className="h-10 w-10" />
              </div>
            )}
          </div>

          <div className="mt-4 divide-y divide-ink-100">
            <Row label="Card type" value={cardTypeLabel(trade.giftCard.cardType)} />
            <Row label="Country" value={trade.giftCard.country} />
            <Row label="Card value" value={`${trade.cardCurrency} ${formatNumber(trade.cardValue)}`} />
            {trade.giftCard.hasCode && trade.giftCard.codeMask && (
              <Row label="E-code" value={<span className="font-mono tracking-wider">{trade.giftCard.codeMask}</span>} />
            )}
            {trade.rate && (
              <Row label="Rate" value={`${formatMoney(trade.rate.rate, trade.rate.currency)} per ${trade.rate.cardCurrency}`} />
            )}
            {trade.giftCard.notes && <Row label="Notes" value={trade.giftCard.notes} />}
            {trade.reviewNote && <Row label="Review note" value={trade.reviewNote} />}
            <Row label="Submitted" value={formatDateTime(trade.createdAt)} />
          </div>
        </section>

        {/* Payout summary */}
        <section className="glass-card p-6">
          <h2 className="text-sm font-semibold text-ink-900">Payout</h2>
          <div className="mt-4 rounded-xl bg-brand-50 p-5">
            <p className="text-xs text-brand-700">
              {trade.status === 'APPROVED' || trade.status === 'COMPLETED' ? 'Paid out' : 'Estimated payout'}
            </p>
            <p className="mt-1 text-3xl font-bold text-ink-900">
              {formatMoney(trade.payoutAmount ?? trade.estimatedValue, trade.currency)}
            </p>
          </div>

          <div className="mt-4 divide-y divide-ink-100">
            <Row label="Card value" value={`${trade.cardCurrency} ${formatNumber(trade.cardValue)}`} />
            <Row label="Estimated" value={formatMoney(trade.estimatedValue, trade.currency)} />
            {trade.payoutAmount != null && (
              <Row label="Payout amount" value={formatMoney(trade.payoutAmount, trade.currency)} />
            )}
            <Row label="Status" value={<Badge className={meta.className}>{meta.label}</Badge>} />
          </div>

          {canCancel && (
            <div className="mt-5">
              <Button variant="secondary" loading={cancelling} onClick={onCancel} className="w-full">
                Cancel trade
              </Button>
            </div>
          )}

          {!isOwner && (
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <ReceiptText className="h-4 w-4 shrink-0" /> You are viewing this as an administrator.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
