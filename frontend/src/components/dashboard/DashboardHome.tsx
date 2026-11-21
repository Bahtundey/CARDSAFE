'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  ReceiptText,
  TrendingUp,
  Plus,
} from 'lucide-react';
import {
  WALLET,
  MY_TRADES,
  TRANSACTIONS,
  TRADING_RATES,
  Wallet,
  Trade,
  LedgerTransaction,
  TradingRate,
} from '@/lib/graphql/operations';
import { useAuth } from '@/lib/auth-context';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/cards/StatCard';
import { formatMoney, formatDateTime } from '@/lib/format';
import { cardTypeLabel } from '@/lib/card-types';

export function DashboardHome() {
  const { user } = useAuth();
  const { data: walletData, loading: walletLoading } = useQuery<{ wallet: Wallet }>(WALLET);
  const { data: tradesData, loading: tradesLoading } = useQuery<{ myTrades: Trade[] }>(MY_TRADES);
  const { data: txData, loading: txLoading } = useQuery<{ transactions: LedgerTransaction[] }>(
    TRANSACTIONS,
    { variables: { limit: 6 } }
  );
  const { data: ratesData, loading: ratesLoading } = useQuery<{ tradingRates: TradingRate[] }>(
    TRADING_RATES
  );

  const trades = tradesData?.myTrades ?? [];
  const pending = trades.filter((t) => t.status === 'PENDING' || t.status === 'UNDER_REVIEW').length;
  const completed = trades.filter((t) => t.status === 'APPROVED' || t.status === 'COMPLETED').length;
  const activeRates = (ratesData?.tradingRates ?? [])
    .filter((r) => r.isActive)
    .slice(0, 5);

  const firstName = user?.name.split(' ')[0] ?? '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Welcome back, {firstName}</h1>
          <p className="mt-1 text-sm text-ink-500">Here&apos;s your trading overview.</p>
        </div>
        <Link
          href="/dashboard/trade"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" /> Sell a gift card
        </Link>
      </div>

      {/* Wallet + stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card relative overflow-hidden p-5 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-ink-500">
            <WalletIcon className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Wallet balance</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-ink-900">
            {walletLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              formatMoney(walletData?.wallet.balance ?? 0, walletData?.wallet.currency ?? 'NGN')
            )}
          </p>
          <p className="mt-1 text-xs text-ink-400">Available for withdrawal</p>
        </div>

        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending trades" value={tradesLoading ? '—' : pending} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Completed" value={tradesLoading ? '—' : completed} />
        <StatCard icon={<ArrowUpRight className="h-5 w-5" />} label="Total trades" value={tradesLoading ? '—' : trades.length} />
      </div>

      {/* Transactions + rates */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent transactions */}
        <section className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Recent transactions</h2>
            <Link href="/dashboard/trades" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View trades
            </Link>
          </div>

          <div className="mt-4">
            {txLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (txData?.transactions ?? []).length === 0 ? (
              <EmptyState
                icon={<ReceiptText className="h-6 w-6" />}
                title="No transactions yet"
                description="When a trade is approved, your payout will appear here."
              />
            ) : (
              <ul className="divide-y divide-ink-100">
                {(txData?.transactions ?? []).map((tx) => (
                  <li key={tx.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink-700">{tx.description}</p>
                      <p className="text-xs text-ink-400">{formatDateTime(tx.createdAt)}</p>
                    </div>
                    <span className={`text-sm font-semibold ${tx.amount >= 0 ? 'text-brand-700' : 'text-red-700'}`}>
                      {tx.amount >= 0 ? '+' : ''}{formatMoney(tx.amount, tx.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Current rates */}
        <section className="glass-card p-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-600" />
            <h2 className="text-base font-semibold text-ink-900">Current trading rates</h2>
          </div>

          <div className="mt-4">
            {ratesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : activeRates.length === 0 ? (
              <EmptyState
                icon={<TrendingUp className="h-6 w-6" />}
                title="No rates available"
                description="Trading rates will appear once an admin publishes them."
              />
            ) : (
              <ul className="divide-y divide-ink-100">
                {activeRates.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-ink-700">{r.brand.name}</p>
                      <p className="text-xs text-ink-400">
                        {cardTypeLabel(r.cardType)} · {r.country}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-ink-900">
                      {formatMoney(r.rate, r.currency)}/{r.cardCurrency}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
