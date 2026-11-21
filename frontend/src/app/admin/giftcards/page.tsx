'use client';

import { BrandsTab, RatesTab } from '@/components/admin/AdminPanel';
import { PageHeader } from '@/components/shared/PageHeader';

export default function AdminGiftCardsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Gift cards" description="Manage brands, logos and trading rates." />
      <BrandsTab />
      <RatesTab />
    </div>
  );
}
