'use client';

import { useQuery } from '@apollo/client';
import { MY_TRADES, Trade } from '@/lib/graphql/operations';
import { TradeList } from '@/components/trades/TradeList';
import { TradeListSkeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/shared/PageHeader';

export default function TradesPage() {
  const { data, loading } = useQuery<{ myTrades: Trade[] }>(MY_TRADES);

  return (
    <div className="space-y-6">
      <PageHeader title="My trades" description="Track the status of your gift card submissions." />

      {loading ? <TradeListSkeleton /> : <TradeList trades={data?.myTrades ?? []} />}
    </div>
  );
}
