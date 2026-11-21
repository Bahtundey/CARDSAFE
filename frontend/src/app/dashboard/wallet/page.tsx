'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { Wallet as WalletIcon, ShieldCheck, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import {
  WALLET,
  TRANSACTIONS,
  MY_TRUST_TIER,
  Wallet,
  LedgerTransaction,
  TrustTierInfo,
} from '@/lib/graphql/operations';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { formatMoney, formatDateTime, transactionTypeLabel, trustTierLabel } from '@/lib/format';

const PAGE_SIZE = 15;

function BalanceRow({ label, value, currency, accent }: { label: string; value: number; currency: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-ink-500">{label}</span>
      <span className={`text-sm font-semibold ${accent ? 'text-ink-900' : 'text-ink-700'}`}>
        {formatMoney(value, currency)}
      </span>
    </div>
  );
}

export default function WalletPage() {
  const [page, setPage] = useState(1);
  const { data: walletData, loading: walletLoading } = useQuery<{ wallet: Wallet }>(WALLET);
  const { data: tierData } = useQuery<{ myTrustTier: TrustTierInfo }>(MY_TRUST_TIER);
  const { data: txData, loading: txLoading } = useQuery<{ transactions: LedgerTransaction[] }>(
    TRANSACTIONS,
    { variables: { limit: 50 } }
  );

  const wallet = walletData?.wallet;
  const tier = tierData?.myTrustTier;
  const transactions = txData?.transactions ?? [];
  const paged = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader title="Wallet" description="Your balances and transaction history." />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-ink-500">
            <WalletIcon className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Balance</span>
          </div>
          {walletLoading ? (
            <Skeleton className="mt-3 h-10 w-40" />
          ) : (
            <>
              <p className="mt-3 text-4xl font-bold text-ink-900">
                {formatMoney(wallet?.balance ?? 0, wallet?.currency ?? 'NGN')}
              </p>
              <div className="mt-4 divide-y divide-ink-100">
                <BalanceRow label="Available" value={wallet?.availableBalance ?? 0} currency={wallet?.currency ?? 'NGN'} />
                <BalanceRow label="Pending (held)" value={wallet?.pendingBalance ?? 0} currency={wallet?.currency ?? 'NGN'} />
              </div>
            </>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 text-ink-500">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Account tier</span>
          </div>
          {tier ? (
            <>
              <p className="mt-3 text-2xl font-bold text-ink-900">{trustTierLabel(tier.tier)}</p>
              <div className="mt-3 space-y-1.5 text-xs text-ink-500">
                <p>Min withdrawal: {formatMoney(tier.minWithdrawal, 'NGN')}</p>
                <p>Max per request: {formatMoney(tier.maxWithdrawalPerRequest, 'NGN')}</p>
                <p>Max per day: {formatMoney(tier.maxWithdrawalPerDay, 'NGN')}</p>
              </div>
              <Link
                href="/dashboard/kyc"
                className="mt-4 inline-block text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Complete KYC to upgrade your tier →
              </Link>
            </>
          ) : (
            <Skeleton className="mt-3 h-20 w-full" />
          )}
        </div>
      </div>

      <section className="glass-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">Transactions</h2>
          <Link href="/dashboard/withdrawals" className="text-xs font-medium text-brand-600 hover:text-brand-700">
            Withdraw funds
          </Link>
        </div>

        <div className="mt-4">
          {txLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : transactions.length === 0 ? (
            <EmptyState icon={<ArrowUpRight className="h-6 w-6" />} title="No transactions yet" description="Your financial activity will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-400">
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 pr-4 font-medium">Description</th>
                    <th className="py-2 pr-4 font-medium">Date</th>
                    <th className="py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {paged.map((tx) => (
                    <tr key={tx.id}>
                      <td className="py-3 pr-4">
                        <Badge className={tx.amount >= 0 ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-red-200 bg-red-50 text-red-700'}>
                          {transactionTypeLabel(tx.type)}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-ink-600">{tx.description}</td>
                      <td className="py-3 pr-4 text-ink-400">{formatDateTime(tx.createdAt)}</td>
                      <td className={`py-3 text-right font-semibold ${tx.amount >= 0 ? 'text-brand-700' : 'text-red-700'}`}>
                        {tx.amount >= 0 ? <ArrowDownLeft className="mr-1 inline h-3.5 w-3.5" /> : <ArrowUpRight className="mr-1 inline h-3.5 w-3.5" />}
                        {formatMoney(tx.amount, tx.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {!txLoading && transactions.length > 0 && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={transactions.length} onPageChange={setPage} />
      )}
    </div>
  );
}
