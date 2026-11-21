'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { ALL_TRANSACTIONS, LedgerTransaction } from '@/lib/graphql/operations';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { Pagination } from '@/components/shared/Pagination';
import { ReceiptText } from 'lucide-react';
import { formatMoney, formatDateTime, transactionTypeLabel } from '@/lib/format';

const PAGE_SIZE = 15;

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1);
  const { data, loading } = useQuery<{ allTransactions: (LedgerTransaction & { user: { name: string; email: string } | null })[] }>(
    ALL_TRANSACTIONS,
    { variables: { limit: 100 } }
  );

  const transactions = data?.allTransactions ?? [];
  const paged = transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" description="Full platform ledger." />

      <div className="glass-card overflow-x-auto p-2">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-11" />)}</div>
        ) : transactions.length === 0 ? (
          <EmptyState icon={<ReceiptText className="h-6 w-6" />} title="No transactions" description="Ledger entries will appear here." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Reference</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {paged.map((t) => (
                <tr key={t.id}>
                  <td className="p-3">
                    <p className="font-medium text-ink-700">{t.user?.name ?? '—'}</p>
                    <p className="text-xs text-ink-400">{t.user?.email}</p>
                  </td>
                  <td className="p-3">
                    <Badge className={t.amount >= 0 ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-red-200 bg-red-50 text-red-700'}>
                      {transactionTypeLabel(t.type)}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-xs text-ink-400">{t.reference}</td>
                  <td className="p-3 text-ink-400">{formatDateTime(t.createdAt)}</td>
                  <td className={`p-3 text-right font-semibold ${t.amount >= 0 ? 'text-brand-700' : 'text-red-700'}`}>
                    {formatMoney(t.amount, t.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && transactions.length > 0 && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={transactions.length} onPageChange={setPage} />
      )}
    </div>
  );
}
