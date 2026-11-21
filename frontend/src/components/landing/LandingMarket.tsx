'use client';

import { useQuery } from '@apollo/client';
import { TrendingUp, Store } from 'lucide-react';
import {
  GIFT_CARD_BRANDS,
  TRADING_RATES,
  GiftCardBrand,
  TradingRate,
} from '@/lib/graphql/operations';
import { SafeImage } from '@/components/ui/SafeImage';
import { formatMoney } from '@/lib/format';
import { cardTypeLabel } from '@/lib/card-types';

function pickRepresentative(rates: TradingRate[]): TradingRate[] {
  const sorted = [...rates].sort((a, b) => {
    if (a.cardCurrency === 'USD' && b.cardCurrency !== 'USD') return -1;
    if (b.cardCurrency === 'USD' && a.cardCurrency !== 'USD') return 1;
    return a.brand.name.localeCompare(b.brand.name);
  });
  const seen = new Set<string>();
  const out: TradingRate[] = [];
  for (const rate of sorted) {
    if (seen.has(rate.brand.id)) continue;
    seen.add(rate.brand.id);
    out.push(rate);
  }
  return out;
}

function SkeletonTiles() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-2xl border border-ink-200 bg-ink-50"
        />
      ))}
    </div>
  );
}

export function LandingMarket() {
  const { data: brandData, loading: brandLoading } = useQuery<{
    giftCardBrands: GiftCardBrand[];
  }>(GIFT_CARD_BRANDS);

  const { data: rateData, loading: rateLoading } = useQuery<{
    tradingRates: TradingRate[];
  }>(TRADING_RATES);

  const brands = (brandData?.giftCardBrands ?? []).filter((b) => b.isActive);
  const rates = (rateData?.tradingRates ?? []).filter((r) => r.isActive);
  const representative = pickRepresentative(rates);

  return (
    <>
      {/* Supported brands */}
      <section id="market" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-3 py-1 text-xs font-medium text-ink-600">
            <Store className="h-3.5 w-3.5" /> Supported brands
          </span>
          <h2 className="mt-4 text-3xl font-bold text-ink-900">Cards we trade</h2>
          <p className="mt-2 text-ink-500">
            A growing catalogue of gift cards, backed by live market rates.
          </p>
        </div>

        {brandLoading ? (
          <SkeletonTiles />
        ) : brands.length === 0 ? (
          <div className="glass-card p-10 text-center text-ink-500">
            Brand catalogue is being prepared. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex flex-col items-center gap-3 rounded-2xl border border-ink-200 bg-surface/80 p-5 text-center transition-colors hover:border-brand-200"
              >
                <SafeImage
                  src={brand.logo?.url}
                  alt={brand.name}
                  className="h-12 w-12 rounded-xl object-contain"
                  fallbackText={brand.name.charAt(0).toUpperCase()}
                />
                <span className="text-sm font-medium text-ink-700">{brand.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Live rates */}
      <section id="rates" className="border-y border-ink-200 bg-surface/70 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <TrendingUp className="h-3.5 w-3.5" /> Live rates
            </span>
            <h2 className="mt-4 text-3xl font-bold text-ink-900">Current trading rates</h2>
            <p className="mt-2 text-ink-500">
              Transparent, market-driven payouts — refreshed straight from the exchange.
            </p>
          </div>

          {rateLoading ? (
            <SkeletonTiles />
          ) : representative.length === 0 ? (
            <div className="glass-card p-10 text-center text-ink-500">
              Rates are being published. Check back soon.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {representative.map((rate) => (
                <div
                  key={rate.id}
                  className="rounded-2xl border border-ink-200 bg-surface/80 p-5"
                >
                  <div className="flex items-center gap-3">
                    <SafeImage
                      src={rate.brand.logo?.url}
                      alt={rate.brand.name}
                      className="h-9 w-9 rounded-lg object-contain"
                      fallbackText={rate.brand.name.charAt(0).toUpperCase()}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {rate.brand.name}
                      </p>
                      <p className="truncate text-xs text-ink-400">
                        {rate.country} · {cardTypeLabel(rate.cardType)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-lg font-bold text-brand-700">
                      {formatMoney(rate.rate, rate.currency)}
                    </span>
                    <span className="text-xs text-ink-400">per 1 {rate.cardCurrency}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
