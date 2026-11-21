'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Check, X, ArrowRight, Banknote } from 'lucide-react';
import {
  ALL_WITHDRAWALS,
  APPROVE_WITHDRAWAL,
  COMPLETE_WITHDRAWAL,
  REJECT_WITHDRAWAL,
  Withdrawal,
  WithdrawalStatus,
} from '@/lib/graphql/operations';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { formatMoney, formatDateTime, withdrawalStatusMeta } from '@/lib/format';
import { extractErrorMessage } from '@/lib/errors';
import { PageHeader } from '@/components/shared/PageHeader';

const FILTERS: { label: string; value: WithdrawalStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function AdminWithdrawalsPage() {
  const toast = useToast();
  const { data, loading } = useQuery<{ allWithdrawals: Withdrawal[] }>(ALL_WITHDRAWALS);
  const [approve] = useMutation(APPROVE_WITHDRAWAL, { refetchQueries: ['AllWithdrawals', 'AdminDashboardStats'] });
  const [complete] = useMutation(COMPLETE_WITHDRAWAL, { refetchQueries: ['AllWithdrawals', 'AdminDashboardStats'] });
  const [reject] = useMutation(REJECT_WITHDRAWAL, { refetchQueries: ['AllWithdrawals', 'AdminDashboardStats'] });

  const [filter, setFilter] = useState<WithdrawalStatus | 'ALL'>('ALL');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const withdrawals = useMemo(() => {
    const all = data?.allWithdrawals ?? [];
    const filtered = filter === 'ALL' ? all : all.filter((w) => w.status === filter);
    return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data, filter]);

  async function onApprove(id: string) {
    setError(null);
    try {
      await approve({ variables: { id } });
      toast.success('Withdrawal approved.');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onComplete(id: string) {
    setError(null);
    try {
      await complete({ variables: { id } });
      toast.success('Withdrawal completed and settled.');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onReject(id: string) {
    setError(null);
    try {
      await reject({ variables: { id, reason } });
      setRejectingId(null);
      setReason('');
      toast.success('Withdrawal rejected.');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Withdrawals" description="Process payout requests." />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              filter === f.value
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-ink-200 bg-surface/70 text-ink-500 hover:border-ink-300 hover:text-ink-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : withdrawals.length === 0 ? (
        <EmptyState icon={<Banknote className="h-6 w-6" />} title="No withdrawals" description="Withdrawal requests will appear here." />
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w) => {
            const meta = withdrawalStatusMeta(w.status);
            const pending = w.status === 'PENDING';
            const processing = w.status === 'PROCESSING';
            return (
              <div key={w.id} className="glass-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink-900">{formatMoney(w.amount, w.currency)}</span>
                      <Badge className={meta.className}>{meta.label}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {w.user?.name ?? 'Unknown'} · {w.bankName} · {w.accountName} · {w.accountNumber} · {formatDateTime(w.createdAt)}
                    </p>
                    <p className="text-[10px] text-ink-400">Ref: {w.reference}</p>
                  </div>

                  {rejectingId === w.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason"
                        className="w-44 rounded-lg border border-ink-200 bg-surface/90 px-3 py-1.5 text-xs text-ink-800 outline-none"
                      />
                      <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onReject(w.id)}>Confirm</Button>
                      <Button variant="ghost" className="px-2 py-1.5 text-xs" onClick={() => { setRejectingId(null); setReason(''); }}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {pending && (
                        <Button className="px-3 py-1.5 text-xs" onClick={() => onApprove(w.id)}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                      )}
                      {processing && (
                        <Button className="px-3 py-1.5 text-xs" onClick={() => onComplete(w.id)}>
                          <ArrowRight className="h-3.5 w-3.5" /> Complete
                        </Button>
                      )}
                      {(pending || processing) && (
                        <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setRejectingId(w.id)}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
