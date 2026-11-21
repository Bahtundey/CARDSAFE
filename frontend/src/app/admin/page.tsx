'use client';

import { useQuery } from '@apollo/client';
import { Users, Clock, CheckCircle2, Banknote, ShieldCheck, Wallet, TrendingUp } from 'lucide-react';
import { ADMIN_DASHBOARD_STATS, AdminStats } from '@/lib/graphql/operations';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/cards/StatCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatMoney } from '@/lib/format';

export default function AdminDashboardPage() {
  const { data, loading } = useQuery<{ adminDashboardStats: AdminStats }>(ADMIN_DASHBOARD_STATS);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  const s = data?.adminDashboardStats;

  return (
    <div className="space-y-6">
      <PageHeader title="Admin dashboard" description="Platform overview and operational metrics." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-4 w-4" />} label="Total users" value={s?.totalUsers ?? 0} sub={`${s?.activeUsers ?? 0} active`} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Pending trades" value={s?.pendingTrades ?? 0} sub={`${s?.completedTrades ?? 0} completed`} />
        <StatCard icon={<Banknote className="h-4 w-4" />} label="Pending withdrawals" value={s?.pendingWithdrawals ?? 0} />
        <StatCard icon={<ShieldCheck className="h-4 w-4" />} label="Pending KYC" value={s?.pendingKyc ?? 0} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Trading volume" value={formatMoney(s?.totalVolume ?? 0, 'NGN')} />
        <StatCard icon={<Wallet className="h-4 w-4" />} label="Wallet liabilities" value={formatMoney(s?.walletLiabilities ?? 0, 'NGN')} />
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Completed trades" value={s?.completedTrades ?? 0} />
      </div>
    </div>
  );
}
