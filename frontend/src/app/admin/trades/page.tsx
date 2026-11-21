'use client';

import { TradesTab } from '@/components/admin/AdminPanel';
import { PageHeader } from '@/components/shared/PageHeader';

export default function AdminTradesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Trades" description="Review and approve gift card submissions." />
      <TradesTab />
    </div>
  );
}
