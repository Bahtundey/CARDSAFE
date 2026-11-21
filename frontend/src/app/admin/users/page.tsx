'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Search } from 'lucide-react';
import {
  ALL_USERS,
  SUSPEND_USER,
  ACTIVATE_USER,
  ADJUST_WALLET,
  AuthUser,
} from '@/lib/graphql/operations';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/format';
import { extractErrorMessage } from '@/lib/errors';

interface AdminUser extends AuthUser {
  createdAt: string;
}

export default function AdminUsersPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, loading } = useQuery<{ allUsers: AdminUser[] }>(ALL_USERS, {
    variables: { search: search || undefined },
  });
  const [suspend] = useMutation(SUSPEND_USER, { refetchQueries: ['AllUsers'] });
  const [activate] = useMutation(ACTIVATE_USER, { refetchQueries: ['AllUsers'] });
  const [adjust] = useMutation(ADJUST_WALLET, { refetchQueries: ['AllUsers', 'AdminDashboardStats'] });

  const users = data?.allUsers ?? [];

  async function onAdjust(id: string) {
    setError(null);
    try {
      await adjust({ variables: { userId: id, amount: Number(adjustAmount), reason: adjustReason || undefined } });
      setAdjustingId(null);
      setAdjustAmount('');
      setAdjustReason('');
      toast.success('Wallet adjusted.');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onSuspend(u: AdminUser) {
    setError(null);
    try {
      await suspend({ variables: { id: u.id } });
      setSuspendTarget(null);
      toast.success(`${u.name} suspended.`);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onActivate(id: string) {
    setError(null);
    try {
      await activate({ variables: { id } });
      toast.success('Account activated.');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Users</h1>
          <p className="mt-1 text-sm text-ink-500">{users.length} accounts.</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-64 rounded-xl border border-ink-200 bg-surface/90 py-2 pl-9 pr-3 text-sm text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="glass-card overflow-x-auto p-2">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="p-3 font-medium">User</th>
                <th className="p-3 font-medium">Role</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Joined</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-3">
                    <p className="font-medium text-ink-700">{u.name}</p>
                    <p className="text-xs text-ink-400">{u.email}</p>
                  </td>
                  <td className="p-3">
                    <Badge className={u.role === 'ADMIN' ? 'border-accent-600/30 bg-accent-500/10 text-accent-600' : 'border-ink-200 bg-ink-100 text-ink-600'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge className={u.isActive ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-red-200 bg-red-50 text-red-700'}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </Badge>
                  </td>
                  <td className="p-3 text-ink-400">{formatDateTime(u.createdAt)}</td>
                  <td className="p-3 text-right">
                    {adjustingId === u.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          placeholder="Amount"
                          className="w-24 rounded-lg border border-ink-200 bg-surface/90 px-2 py-1 text-xs text-ink-800 outline-none"
                        />
                        <input
                          value={adjustReason}
                          onChange={(e) => setAdjustReason(e.target.value)}
                          placeholder="Reason"
                          className="w-28 rounded-lg border border-ink-200 bg-surface/90 px-2 py-1 text-xs text-ink-800 outline-none"
                        />
                        <Button className="px-2 py-1 text-xs" onClick={() => onAdjust(u.id)}>Apply</Button>
                        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => setAdjustingId(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setAdjustingId(u.id)} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                          Adjust wallet
                        </button>
                        {u.role !== 'ADMIN' &&
                          (u.isActive ? (
                            <button onClick={() => setSuspendTarget(u)} className="text-xs font-medium text-red-600 hover:text-red-700">
                              Suspend
                            </button>
                          ) : (
                            <button onClick={() => onActivate(u.id)} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                              Activate
                            </button>
                          ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(suspendTarget)}
        title="Suspend this user?"
        description={
          suspendTarget
            ? `${suspendTarget.name} (${suspendTarget.email}) will be unable to sign in or trade until reactivated.`
            : undefined
        }
        confirmLabel="Suspend user"
        destructive
        onCancel={() => setSuspendTarget(null)}
        onConfirm={() => suspendTarget && onSuspend(suspendTarget)}
      />
    </div>
  );
}
