'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Check, X, Eye } from 'lucide-react';
import { ALL_KYC, APPROVE_KYC, REJECT_KYC, KycRecord, KycStatus } from '@/lib/graphql/operations';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { kycStatusMeta, documentTypeLabel, formatDateTime } from '@/lib/format';
import { extractErrorMessage } from '@/lib/errors';
import { PageHeader } from '@/components/shared/PageHeader';

const FILTERS: { label: string; value: KycStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Under review', value: 'UNDER_REVIEW' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
];

export default function AdminKycPage() {
  const toast = useToast();
  const { data, loading } = useQuery<{ allKyc: KycRecord[] }>(ALL_KYC);
  const [approve] = useMutation(APPROVE_KYC, { refetchQueries: ['AllKyc', 'AdminDashboardStats'] });
  const [reject] = useMutation(REJECT_KYC, { refetchQueries: ['AllKyc', 'AdminDashboardStats'] });

  const [filter, setFilter] = useState<KycStatus | 'ALL'>('ALL');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const records = useMemo(() => {
    const all = data?.allKyc ?? [];
    const filtered = filter === 'ALL' ? all : all.filter((k) => k.status === filter);
    return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [data, filter]);

  async function onApprove(id: string) {
    setError(null);
    try {
      await approve({ variables: { id } });
      toast.success('KYC approved — user tier upgraded.');
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
      toast.success('KYC rejected.');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="KYC reviews" description="Verify user identity documents." />

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
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : records.length === 0 ? (
        <EmptyState icon={<Eye className="h-6 w-6" />} title="No KYC submissions" description="Submitted documents will appear here for review." />
      ) : (
        <div className="space-y-3">
          {records.map((k) => {
            const meta = kycStatusMeta(k.status);
            const needsReview = k.status === 'PENDING' || k.status === 'UNDER_REVIEW';
            return (
              <div key={k.id} className="glass-card p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink-900">{k.user?.name ?? 'Unknown'}</span>
                      <span className="text-xs text-ink-400">{k.user?.email}</span>
                      <Badge className={meta.className}>{meta.label}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {documentTypeLabel(k.documentType)} · submitted {formatDateTime(k.createdAt)}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <a href={k.documentImage.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                        <Eye className="h-3.5 w-3.5" /> Document
                      </a>
                      {k.selfieImage && (
                        <a href={k.selfieImage.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700">
                          <Eye className="h-3.5 w-3.5" /> Selfie
                        </a>
                      )}
                    </div>
                    {k.rejectionReason && <p className="mt-1 text-xs text-red-600">{k.rejectionReason}</p>}
                  </div>

                  {needsReview &&
                    (rejectingId === k.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Reason"
                          className="w-44 rounded-lg border border-ink-200 bg-surface/90 px-3 py-1.5 text-xs text-ink-800 outline-none"
                        />
                        <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onReject(k.id)}>Confirm</Button>
                        <Button variant="ghost" className="px-2 py-1.5 text-xs" onClick={() => { setRejectingId(null); setReason(''); }}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button className="px-3 py-1.5 text-xs" onClick={() => onApprove(k.id)}>
                          <Check className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setRejectingId(k.id)}>
                          <X className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
