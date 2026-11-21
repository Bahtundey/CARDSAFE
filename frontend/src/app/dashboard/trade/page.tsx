'use client';

import { TradeForm } from '@/components/trade/TradeForm';
import { PageHeader } from '@/components/shared/PageHeader';

export default function TradePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Sell a gift card"
        description="Choose a brand, enter the card details and upload a photo to get an instant estimate."
      />
      <TradeForm />
    </div>
  );
}
