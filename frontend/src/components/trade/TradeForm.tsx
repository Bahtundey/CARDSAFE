'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { ChevronRight, Info, KeyRound } from 'lucide-react';
import {
  GIFT_CARD_BRANDS,
  TRADING_RATES,
  TRADE_ESTIMATE,
  CREATE_TRADE,
  GiftCardBrand,
  TradingRate,
  TradeEstimate,
  UploadedMedia,
} from '@/lib/graphql/operations';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useToast } from '@/components/ui/Toast';
import { DragDropUpload } from '@/components/upload/DragDropUpload';
import { CountrySelect } from '@/components/ui/CountrySelect';
import { extractErrorMessage } from '@/lib/errors';
import { formatMoney, formatNumber } from '@/lib/format';
import { CARD_TYPE_LABELS, isEcode } from '@/lib/card-types';

function BrandLogo({ brand, size = 48 }: { brand: GiftCardBrand; size?: number }) {
  const [broken, setBroken] = useState(false);
  if (brand.logo?.url && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={brand.logo.url}
        alt={brand.name}
        className="h-full w-full rounded-xl object-contain"
        style={{ width: size, height: size }}
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <span
      className="flex items-center justify-center rounded-xl bg-gradient-to-br from-ink-100 to-ink-200 font-bold text-brand-600"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {brand.name.charAt(0).toUpperCase()}
    </span>
  );
}

function StepLabel({ step, title }: { step: number; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
        {step}
      </span>
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
    </div>
  );
}

export function TradeForm() {
  const router = useRouter();
  const toast = useToast();

  const { data: brandsData, loading: brandsLoading } = useQuery<{
    giftCardBrands: GiftCardBrand[];
  }>(GIFT_CARD_BRANDS);
  const { data: ratesData } = useQuery<{ tradingRates: TradingRate[] }>(TRADING_RATES);
  const [createTrade, { loading: submitting }] = useMutation<{
    createTrade: { id: string };
  }>(CREATE_TRADE, { refetchQueries: ['MyTrades'] });

  const [brandId, setBrandId] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [cardType, setCardType] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [imageMedia, setImageMedia] = useState<UploadedMedia | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [debouncedValue, setDebouncedValue] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), 350);
    return () => clearTimeout(t);
  }, [value]);

  const brands = useMemo(
    () => (brandsData?.giftCardBrands ?? []).filter((b) => b.isActive),
    [brandsData]
  );
  const selectedBrand = brands.find((b) => b.id === brandId);
  const rates = ratesData?.tradingRates ?? [];
  const brandRates = rates.filter((r) => r.brand.id === brandId && r.isActive);
  const countries = selectedBrand?.supportedCountries ?? [];
  const cardTypes = useMemo(
    () => [...new Set(brandRates.filter((r) => r.country === country).map((r) => r.cardType))],
    [brandRates, country]
  );

  const isEcodeType = Boolean(cardType && isEcode(cardType));

  const canEstimate = Boolean(brandId && country && cardType && Number(debouncedValue) > 0);
  const { data: estimateData, loading: estimateLoading } = useQuery<{
    tradeEstimate: TradeEstimate;
  }>(TRADE_ESTIMATE, {
    variables: {
      input: { brandId, country, cardType, value: Number(debouncedValue) },
    },
    skip: !canEstimate,
  });
  const estimate = estimateData?.tradeEstimate ?? null;

  function selectBrand(id: string) {
    setBrandId(id);
    setCountry(null);
    setCardType(null);
    setValue('');
    setCode('');
  }

  function selectCountry(code: string) {
    setCountry(code);
    setCardType(null);
  }

  function selectCardType(type: string) {
    setCardType(type);
    setCode('');
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (isEcodeType) {
      const trimmed = code.trim();
      if (!trimmed) {
        setSubmitError('Enter the gift card code.');
        return;
      }
      if (trimmed.length < 4 || trimmed.length > 200) {
        setSubmitError('The gift card code must be between 4 and 200 characters.');
        return;
      }
    } else if (!imageMedia) {
      setSubmitError('Please upload a gift card image.');
      return;
    }

    try {
      const result = await createTrade({
        variables: {
          input: {
            brandId,
            country,
            cardType,
            value: Number(value),
            ...(isEcodeType
              ? { code: code.trim() }
              : { imageMediaId: imageMedia?.id }),
            notes: notes.trim() || null,
          },
        },
      });
      const tradeId = result.data?.createTrade?.id;
      if (tradeId) {
        toast.success(
          'Your gift card has been submitted successfully. You can track its progress from your dashboard.'
        );
        router.push('/dashboard');
      }
    } catch (err) {
      setSubmitError(extractErrorMessage(err));
    }
  }

  const codeValid = isEcodeType
    ? code.trim().length >= 4 && code.trim().length <= 200
    : true;
  const canSubmit = Boolean(
    brandId &&
      country &&
      cardType &&
      Number(value) > 0 &&
      codeValid &&
      (isEcodeType ? true : Boolean(imageMedia)) &&
      !submitting
  );

  if (brandsLoading) {
    return <div className="glass-card h-64 animate-pulse" />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={onSubmit} className="space-y-6">
        {submitError && <Alert variant="error">{submitError}</Alert>}

        {/* Step 1 — brand */}
        <section className="glass-card p-6">
          <StepLabel step={1} title="Choose a gift card brand" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {brands.map((brand) => {
              const active = brand.id === brandId;
              return (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => selectBrand(brand.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-3 transition-colors ${
                    active
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-ink-200 bg-surface/70 hover:border-ink-300'
                  }`}
                >
                  <BrandLogo brand={brand} size={44} />
                  <span className={`text-xs font-medium ${active ? 'text-brand-600' : 'text-ink-600'}`}>
                    {brand.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2 — country */}
        {selectedBrand && (
          <section className="glass-card p-6">
            <StepLabel step={2} title="Select country" />
            <div className="mt-4 max-w-sm">
              <CountrySelect options={countries} value={country} onChange={selectCountry} />
            </div>
          </section>
        )}

        {/* Step 3 — card type */}
        {country && cardTypes.length > 0 && (
          <section className="glass-card p-6">
            <StepLabel step={3} title="Select card type" />
            <div className="mt-4 flex flex-wrap gap-2">
              {cardTypes.map((type) => {
                const active = type === cardType;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => selectCardType(type)}
                    className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
                      active
                        ? 'border-brand-500 bg-brand-50 font-semibold text-brand-600'
                        : 'border-ink-200 bg-surface/70 text-ink-600 hover:border-ink-300'
                    }`}
                  >
                    {CARD_TYPE_LABELS[type as keyof typeof CARD_TYPE_LABELS] ?? type}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 4 — amount */}
        {cardType && (
          <section className="glass-card p-6">
            <StepLabel step={4} title="Enter card value" />
            <div className="mt-4 max-w-xs">
              <label className="mb-1.5 block text-sm font-medium text-ink-600">Card value (USD)</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
                  $
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="100.00"
                  className="w-full rounded-xl border border-ink-200 bg-surface/90 py-2.5 pl-8 pr-3.5 text-sm text-ink-800 placeholder:text-ink-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              {estimate && (
                <p className="mt-2 text-xs text-ink-400">
                  Min {formatNumber(estimate.minAmount)} · Max {formatNumber(estimate.maxAmount)}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Step 5 — e-code input OR image upload */}
        {cardType && (
          <section className="glass-card p-6">
            {isEcodeType ? (
              <>
                <StepLabel step={5} title="Enter the gift card code" />
                <p className="mt-1 text-xs text-ink-400">
                  The code is encrypted in storage and never shown publicly.
                </p>
                <div className="mt-4 max-w-md">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter your gift card code here"
                      autoComplete="off"
                      spellCheck={false}
                      className="w-full rounded-xl border border-ink-200 bg-surface/90 py-2.5 pl-10 pr-3.5 text-sm text-ink-800 placeholder:text-ink-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <p className="mt-2 text-xs text-ink-400">
                    Between 4 and 200 characters.
                  </p>
                </div>
              </>
            ) : (
              <>
                <StepLabel step={5} title="Upload card image" />
                <p className="mt-1 text-xs text-ink-400">A clear photo of the gift card (code side).</p>
                <div className="mt-4">
                  <DragDropUpload
                    folder="gift-cards"
                    onUploaded={setImageMedia}
                    onClear={() => setImageMedia(null)}
                  />
                </div>
              </>
            )}
          </section>
        )}

        {/* Step 6 — notes */}
        <section className="glass-card p-6">
          <StepLabel step={6} title="Notes (optional)" />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Anything the reviewer should know…"
            className="mt-4 w-full rounded-xl border border-ink-200 bg-surface/90 px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </section>

        {/* Mobile submit */}
        <Button type="submit" loading={submitting} disabled={!canSubmit} className="w-full lg:hidden">
          Submit trade
        </Button>
      </form>

      {/* Summary */}
      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold text-ink-900">Trade summary</h3>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-500">Brand</span>
              <span className="font-medium text-ink-700">{selectedBrand?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Country</span>
              <span className="font-medium text-ink-700">
                {countries.find((c) => c.code === country)?.name ?? '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Card type</span>
              <span className="font-medium text-ink-700">
                {cardType ? CARD_TYPE_LABELS[cardType as keyof typeof CARD_TYPE_LABELS] ?? cardType : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-500">Card value</span>
              <span className="font-medium text-ink-700">
                {value ? `$${formatNumber(Number(value))}` : '—'}
              </span>
            </div>
          </div>

          <div className="mt-4 border-t border-ink-200 pt-4">
            {estimateLoading ? (
              <p className="text-sm text-ink-400">Calculating…</p>
            ) : estimate ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-ink-500">Trading rate</span>
                  <span className="font-medium text-ink-700">
                    {formatMoney(estimate.rate, estimate.currency)} per {estimate.cardCurrency}
                  </span>
                </div>
                <div className="mt-3 rounded-xl bg-brand-50 p-4">
                  <p className="text-xs text-brand-600">Estimated payout</p>
                  <p className="mt-1 text-2xl font-bold text-ink-900">
                    {formatMoney(estimate.estimatedValue, estimate.currency)}
                  </p>
                </div>
              </>
            ) : (
              <p className="flex items-center gap-1.5 text-xs text-ink-400">
                <Info className="h-3.5 w-3.5" /> Select a brand, country, type and amount to see your payout.
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={onSubmit}
            loading={submitting}
            disabled={!canSubmit}
            className="mt-5 hidden w-full lg:flex"
          >
            Submit trade <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </aside>
    </div>
  );
}
