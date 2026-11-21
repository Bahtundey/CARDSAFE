'use client';

import { useQuery } from '@apollo/client';
import { ScrollText } from 'lucide-react';
import { AUDIT_LOGS, AuditLog } from '@/lib/graphql/operations';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/format';
import { PageHeader } from '@/components/shared/PageHeader';

export default function AdminSettingsPage() {
  const { data, loading } = useQuery<{ auditLogs: AuditLog[] }>(AUDIT_LOGS, { variables: { limit: 100 } });

  const logs = data?.auditLogs ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings &amp; audit log" description="Sensitive actions across the platform." />

      <div className="glass-card overflow-x-auto p-2">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : logs.length === 0 ? (
          <EmptyState icon={<ScrollText className="h-6 w-6" />} title="No audit logs yet" description="Sensitive actions will be recorded here." />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 text-left text-xs uppercase tracking-wide text-ink-400">
                <th className="p-3 font-medium">Action</th>
                <th className="p-3 font-medium">Actor</th>
                <th className="p-3 font-medium">Target</th>
                <th className="p-3 font-medium">IP</th>
                <th className="p-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="p-3">
                    <span className="rounded-md bg-ink-100 px-2 py-0.5 font-mono text-xs text-ink-600">{log.action}</span>
                  </td>
                  <td className="p-3 text-ink-500">{log.actorId?.email ?? 'system'}</td>
                  <td className="p-3 text-ink-400">{log.targetType ?? '—'}</td>
                  <td className="p-3 font-mono text-xs text-ink-400">{log.ip ?? '—'}</td>
                  <td className="p-3 text-ink-400">{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
