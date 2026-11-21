'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Banknote } from 'lucide-react';
import {
  WALLET,
  WITHDRAWALS,
  MY_TRUST_TIER,
  REQUEST_WITHDRAWAL,
  CANCEL_WITHDRAWAL,
  Wallet,
  Withdrawal,
  TrustTierInfo,
} from '@/lib/graphql/operations';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatMoney, formatDateTime, withdrawalStatusMeta } from '@/lib/format';
import { extractErrorMessage } from '@/lib/errors';
import { PageHeader } from '@/components/shared/PageHeader';

export default function WithdrawalsPage() {
  const toast = useToast();
  const { data: walletData } = useQuery<{ wallet: Wallet }>(WALLET);
  const { data: tierData } = useQuery<{ myTrustTier: TrustTierInfo }>(MY_TRUST_TIER);
  const { data: wdData, loading: wdLoading } = useQuery<{ withdrawals: Withdrawal[] }>(WITHDRAWALS);
  const [request, { loading: requesting }] = useMutation(REQUEST_WITHDRAWAL, {
    refetchQueries: ['Withdrawals', 'Wallet'],
  });
  const [cancel, { loading: cancelling }] = useMutation(CANCEL_WITHDRAWAL, {
    refetchQueries: ['Withdrawals', 'Wallet'],
  });

  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const wallet = walletData?.wallet;
  const tier = tierData?.myTrustTier;
  const withdrawals = wdData?.withdrawals ?? [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await request({
        variables: {
          input: {
            amount: Number(amount),
            bankName,
            accountName,
            accountNumber,
          },
        },
      });
      toast.success('Withdrawal requested — pending review.');
      setAmount('');
      setBankName('');
      setAccountName('');
      setAccountNumber('');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onCancel(id: string) {
    setError(null);
    try {
      await cancel({ variables: { id } });
      toast.success('Withdrawal cancelled.');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Withdrawals" description="Request a payout to your bank account." />

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request form */}
        <form onSubmit={onSubmit} className="glass-card space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Request withdrawal</h2>
            <span className="text-xs text-ink-400">
              Available: <span className="font-semibold text-ink-700">{formatMoney(wallet?.availableBalance ?? 0, wallet?.currency ?? 'NGN')}</span>
            </span>
          </div>

          <Input
            label="Amount (₦)"
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 10000"
          />
          <Input label="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. GTBank" />
          <Input label="Account name" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Account holder name" />
          <Input
            label="Account number"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="10-digit account number"
            maxLength={10}
          />

          {tier && (
            <p className="text-xs text-ink-400">
              Tier {tier.tier.replace('_', ' ')} · Min {formatMoney(tier.minWithdrawal, 'NGN')} · Max{' '}
              {formatMoney(tier.maxWithdrawalPerRequest, 'NGN')} per request
            </p>
          )}

          <Button type="submit" loading={requesting} disabled={!amount || !bankName || !accountName || !accountNumber}>
            Request withdrawal
          </Button>
        </form>

        {/* History */}
        <section className="glass-card p-6">
          <h2 className="text-base font-semibold text-ink-900">History</h2>
          <div className="mt-4">
            {wdLoading ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : withdrawals.length === 0 ? (
              <EmptyState icon={<Banknote className="h-6 w-6" />} title="No withdrawals yet" description="Your withdrawal requests will appear here." />
            ) : (
              <ul className="divide-y divide-ink-100">
                {withdrawals.map((w) => {
                  const meta = withdrawalStatusMeta(w.status);
                  return (
                    <li key={w.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-ink-900">{formatMoney(w.amount, w.currency)}</p>
                          <p className="text-xs text-ink-400">
                            {w.bankName} · {w.accountNumber} · {formatDateTime(w.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={meta.className}>{meta.label}</Badge>
                          {w.status === 'PENDING' && (
                            <button
                              onClick={() => setCancelId(w.id)}
                              disabled={cancelling}
                              className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                      {w.rejectionReason && <p className="mt-1 text-xs text-red-600">{w.rejectionReason}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(cancelId)}
        title="Cancel this withdrawal?"
        description="The held funds will be returned to your available balance."
        confirmLabel="Cancel withdrawal"
        destructive
        loading={cancelling}
        onCancel={() => setCancelId(null)}
        onConfirm={() => {
          if (cancelId) onCancel(cancelId);
          setCancelId(null);
        }}
      />
    </div>
  );
}
