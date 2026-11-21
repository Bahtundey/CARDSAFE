'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Check,
  X,
  ShieldCheck,
  Pencil,
  Trash2,
  Eye,
  Search,
  KeyRound,
} from 'lucide-react';
import {
  ALL_TRADES,
  GIFT_CARD_BRANDS,
  TRADING_RATES,
  APPROVE_TRADE,
  REJECT_TRADE,
  CREATE_GIFT_CARD_BRAND,
  UPDATE_GIFT_CARD_BRAND,
  SET_GIFT_CARD_BRAND_ACTIVE,
  UPDATE_TRADING_RATE,
  REVEAL_GIFT_CARD_CODE,
  COUNTRIES,
  Trade,
  GiftCardBrand,
  TradingRate,
  Country,
} from '@/lib/graphql/operations';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { DragDropUpload } from '@/components/upload/DragDropUpload';
import { Dialog } from '@/components/ui/Dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SafeImage } from '@/components/ui/SafeImage';
import { statusMeta, formatMoney, formatNumber, formatDate } from '@/lib/format';
import { extractErrorMessage } from '@/lib/errors';
import { CARD_TYPES, CARD_TYPE_LABELS, cardTypeLabel } from '@/lib/card-types';
import { countryFlag } from '@/lib/countries';

// ─────────────────────────────────────────────────────────────────────────────
// Trades tab
// ─────────────────────────────────────────────────────────────────────────────

export function TradesTab() {
  const { data, loading } = useQuery<{ allTrades: Trade[] }>(ALL_TRADES);
  const [approve] = useMutation<{ approveTrade: Trade }>(APPROVE_TRADE, {
    refetchQueries: ['AllTrades'],
  });
  const [reject] = useMutation<{ rejectTrade: Trade }>(REJECT_TRADE, {
    refetchQueries: ['AllTrades'],
  });
  const [revealCode] = useMutation<{ revealGiftCardCode: string | null }>(REVEAL_GIFT_CARD_CODE);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<{ id: string; code: string } | null>(null);

  const trades = data?.allTrades ?? [];

  async function onApprove(id: string) {
    setError(null);
    try {
      await approve({ variables: { id } });
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
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  async function onReveal(giftCardId: string) {
    setError(null);
    try {
      const res = await revealCode({ variables: { giftCardId } });
      const code = res.data?.revealGiftCardCode;
      if (code) setRevealed({ id: giftCardId, code });
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <EmptyState
        icon={<ShieldCheck className="h-6 w-6" />}
        title="No trades submitted"
        description="Submitted gift cards will appear here for review."
      />
    );
  }

  return (
    <div className="space-y-3">
      {error && <Alert variant="error">{error}</Alert>}
      {trades.map((trade) => {
        const meta = statusMeta(trade.status);
        const isPending = trade.status === 'PENDING' || trade.status === 'UNDER_REVIEW';
        const codeRevealed = revealed?.id === trade.giftCard.id;
        return (
          <div key={trade.id} className="glass-card p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-ink-900">{trade.brand.name}</span>
                  <Badge className={meta.className}>{meta.label}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-ink-400">
                  {cardTypeLabel(trade.giftCard.cardType)} · {trade.giftCard.country} ·{' '}
                  {trade.user?.name ?? 'Unknown'} · {formatDate(trade.createdAt)}
                </p>
                <p className="mt-1 text-sm text-ink-600">
                  Card: {trade.cardCurrency} {formatNumber(trade.cardValue)} · Payout:{' '}
                  <span className="font-semibold text-ink-900">
                    {formatMoney(trade.estimatedValue, trade.currency)}
                  </span>
                </p>
                {trade.giftCard.hasCode && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-ink-50 px-2 py-0.5 font-mono text-xs text-ink-600">
                      <KeyRound className="h-3 w-3" /> {trade.giftCard.codeMask}
                    </span>
                    {codeRevealed ? (
                      <code className="rounded-lg border border-brand-200 bg-brand-50 px-2 py-0.5 font-mono text-xs text-brand-700">
                        {revealed?.code}
                      </code>
                    ) : (
                      <button
                        onClick={() => onReveal(trade.giftCard.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        <Eye className="h-3 w-3" /> Reveal
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isPending && (
                <div className="flex items-center gap-2">
                  {rejectingId === trade.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Rejection reason"
                        className="w-44 rounded-lg border border-ink-200 bg-surface/90 px-3 py-1.5 text-xs text-ink-800 placeholder:text-ink-400 outline-none focus:border-red-400/60"
                      />
                      <Button variant="danger" className="px-3 py-1.5 text-xs" onClick={() => onReject(trade.id)}>
                        Confirm
                      </Button>
                      <Button
                        variant="ghost"
                        className="px-2 py-1.5 text-xs"
                        onClick={() => {
                          setRejectingId(null);
                          setReason('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button className="px-3 py-1.5 text-xs" onClick={() => onApprove(trade.id)}>
                        <Check className="h-3.5 w-3.5" /> Approve
                      </Button>
                      <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setRejectingId(trade.id)}>
                        <X className="h-3.5 w-3.5" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Country multi-picker (admin brand editor)
// ─────────────────────────────────────────────────────────────────────────────

function CountryPicker({
  options,
  selected,
  onChange,
}: {
  options: Country[];
  selected: string[];
  onChange: (codes: string[]) => void;
}) {
  const [q, setQ] = useState('');
  const filtered = options.filter(
    (o) =>
      o.name.toLowerCase().includes(q.trim().toLowerCase()) ||
      o.code.toLowerCase().includes(q.trim().toLowerCase())
  );

  function toggle(code: string) {
    onChange(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code]);
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search countries…"
          className="w-full rounded-lg border border-ink-200 bg-surface/90 py-2 pl-8 pr-3 text-sm text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-500"
        />
      </div>
      <div className="mt-2 grid max-h-48 grid-cols-1 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
        {filtered.length === 0 ? (
          <p className="col-span-full py-4 text-center text-xs text-ink-400">No countries match your search.</p>
        ) : (
          filtered.map((o) => {
            const active = selected.includes(o.code);
            return (
              <button
                key={o.code}
                type="button"
                onClick={() => toggle(o.code)}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors ${
                  active
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-ink-200 bg-surface/70 text-ink-600 hover:border-ink-300'
                }`}
              >
                <span>{countryFlag(o.code)}</span>
                <span className="flex-1 truncate">{o.name}</span>
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Brand form (create + edit)
// ─────────────────────────────────────────────────────────────────────────────

function BrandForm({
  countries,
  initial,
  onDone,
}: {
  countries: Country[];
  initial?: GiftCardBrand | null;
  onDone: () => void;
}) {
  const editing = Boolean(initial);
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [selected, setSelected] = useState<string[]>(
    initial?.supportedCountries.map((c) => c.code) ?? []
  );
  const [logo, setLogo] = useState<{ url: string; publicId: string } | null>(
    initial?.logo ?? null
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [createBrand, { loading: creating }] = useMutation<{ createGiftCardBrand: GiftCardBrand }>(
    CREATE_GIFT_CARD_BRAND,
    { refetchQueries: ['GiftCardBrands'] }
  );
  const [updateBrand, { loading: updating }] = useMutation<{ updateGiftCardBrand: GiftCardBrand }>(
    UPDATE_GIFT_CARD_BRAND,
    { refetchQueries: ['GiftCardBrands'] }
  );

  const submitting = creating || updating;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const supportedCountries = selected.map((code) => {
      const c = countries.find((country) => country.code === code)!;
      return { code: c.code, name: c.name };
    });
    const logoInput = logo ? { url: logo.url, publicId: logo.publicId } : null;
    try {
      if (editing && initial) {
        await updateBrand({
          variables: {
            id: initial.id,
            input: {
              name,
              slug: slug || undefined,
              category,
              supportedCountries,
              logo: logoInput,
            },
          },
        });
        setSuccess('Brand updated.');
      } else {
        await createBrand({
          variables: {
            input: {
              name,
              slug: slug || undefined,
              category,
              supportedCountries,
              logo: logoInput,
            },
          },
        });
        setSuccess(`Brand "${name}" created.`);
        setName('');
        setSlug('');
        setCategory('');
        setSelected([]);
        setLogo(null);
      }
      if (editing) onDone();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Apple" />
      <Input
        label="Slug (optional)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="auto-generated from name"
      />
      <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Retail, Gaming" />

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-600">Supported countries</p>
        <CountryPicker options={countries} selected={selected} onChange={setSelected} />
      </div>

      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-600">Brand logo</p>
        {logo ? (
          <div className="flex items-center gap-3">
            <SafeImage src={logo.url} alt={name || 'Brand logo'} className="h-12 w-12 rounded-xl object-contain" fallbackText={(name || 'B').charAt(0)} />
            <div className="text-xs text-ink-500">
              <p>Logo uploaded.</p>
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="mt-1 inline-flex items-center gap-1 font-medium text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" /> Remove logo
              </button>
            </div>
          </div>
        ) : (
          <DragDropUpload
            folder="brand-logos"
            onUploaded={(m) => setLogo({ url: m.url, publicId: m.publicId })}
            onClear={() => setLogo(null)}
          />
        )}
        {initial?.logo && !logo && (
          <p className="mt-2 text-xs text-ink-400">Saving without a logo removes the current one.</p>
        )}
      </div>

      <Button type="submit" loading={submitting} disabled={!name.trim() || !category.trim()}>
        {editing ? 'Save changes' : 'Create brand'}
      </Button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Brands tab
// ─────────────────────────────────────────────────────────────────────────────

export function BrandsTab() {
  const { data } = useQuery<{ giftCardBrands: GiftCardBrand[] }>(GIFT_CARD_BRANDS);
  const { data: countriesData } = useQuery<{ countries: Country[] }>(COUNTRIES);
  const [setActive] = useMutation<{ setGiftCardBrandActive: GiftCardBrand }>(
    SET_GIFT_CARD_BRAND_ACTIVE,
    { refetchQueries: ['GiftCardBrands'] }
  );

  const [editingBrand, setEditingBrand] = useState<GiftCardBrand | null>(null);
  const [toggling, setToggling] = useState<{ brand: GiftCardBrand; next: boolean } | null>(null);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const brands = data?.giftCardBrands ?? [];
  const countries = countriesData?.countries ?? [];

  async function onToggleConfirm() {
    if (!toggling) return;
    setToggleError(null);
    setToggleLoading(true);
    try {
      await setActive({ variables: { id: toggling.brand.id, isActive: toggling.next } });
      setToggling(null);
    } catch (err) {
      setToggleError(extractErrorMessage(err));
    } finally {
      setToggleLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Create form */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-ink-900">Add a brand</h3>
        <div className="mt-4">
          <BrandForm countries={countries} onDone={() => {}} />
        </div>
      </div>

      {/* Brand list */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-ink-900">Brands ({brands.length})</h3>
        <ul className="mt-4 divide-y divide-ink-100">
          {brands.map((brand) => (
            <li key={brand.id} className="flex items-center justify-between py-3">
              <div className="flex min-w-0 items-center gap-3">
                <SafeImage
                  src={brand.logo?.url}
                  alt={brand.name}
                  className="h-9 w-9 shrink-0 rounded-lg object-contain"
                  fallbackText={brand.name.charAt(0).toUpperCase()}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-ink-700">{brand.name}</p>
                    {brand.isActive ? (
                      <Badge className="border-brand-200 bg-brand-50 text-brand-700">Active</Badge>
                    ) : (
                      <Badge className="border-slate-200 bg-slate-100 text-ink-500">Inactive</Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-ink-400">
                    {brand.category} · {brand.supportedCountries.length} countries
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => setEditingBrand(brand)}
                  className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
                  aria-label={`Edit ${brand.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {brand.isActive ? (
                  <button
                    onClick={() => setToggling({ brand, next: false })}
                    className="text-xs font-medium text-red-600 hover:text-red-700"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => setToggling({ brand, next: true })}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    Activate
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit dialog */}
      <Dialog open={Boolean(editingBrand)} onClose={() => setEditingBrand(null)} maxWidth="max-w-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-ink-900">Edit {editingBrand?.name}</h3>
          <button
            onClick={() => setEditingBrand(null)}
            className="rounded-lg p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5">
          {editingBrand && (
            <BrandForm
              key={editingBrand.id}
              countries={countries}
              initial={editingBrand}
              onDone={() => setEditingBrand(null)}
            />
          )}
        </div>
      </Dialog>

      {/* Activate / deactivate confirmation */}
      <ConfirmDialog
        open={Boolean(toggling)}
        title={toggling?.next ? 'Activate brand?' : 'Deactivate brand?'}
        description={
          toggling
            ? toggling.next
              ? `${toggling.brand.name} will become available to users again.`
              : `${toggling.brand.name} will no longer appear as a trading option. Existing trade history is preserved.`
            : ''
        }
        confirmLabel={toggling?.next ? 'Activate' : 'Deactivate'}
        destructive={!toggling?.next}
        loading={toggleLoading}
        onConfirm={onToggleConfirm}
        onCancel={() => {
          setToggling(null);
          setToggleError(null);
        }}
      />
      {toggleError && <Alert variant="error">{toggleError}</Alert>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Rates tab
// ─────────────────────────────────────────────────────────────────────────────

export function RatesTab() {
  const { data: brandsData } = useQuery<{ giftCardBrands: GiftCardBrand[] }>(GIFT_CARD_BRANDS);
  const { data: ratesData } = useQuery<{ tradingRates: TradingRate[] }>(TRADING_RATES);
  const [updateRate] = useMutation(UPDATE_TRADING_RATE, { refetchQueries: ['TradingRates'] });

  const [brandId, setBrandId] = useState('');
  const [country, setCountry] = useState('');
  const [cardType, setCardType] = useState<string>('PHYSICAL');
  const [cardCurrency, setCardCurrency] = useState('USD');
  const [currency, setCurrency] = useState('NGN');
  const [rate, setRate] = useState('');
  const [minAmount, setMinAmount] = useState('25');
  const [maxAmount, setMaxAmount] = useState('1000');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const brands = brandsData?.giftCardBrands ?? [];
  const rates = ratesData?.tradingRates ?? [];
  const selectedBrand = brands.find((b) => b.id === brandId);
  const brandCountries = selectedBrand?.supportedCountries ?? [];

  const ratesForBrand = useMemo(() => {
    if (!brandId) return rates;
    return rates.filter((r) => r.brand.id === brandId);
  }, [rates, brandId]);

  async function onUpsert(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await updateRate({
        variables: {
          input: {
            brandId,
            country,
            cardType,
            cardCurrency: cardCurrency.toUpperCase() || undefined,
            currency: currency.toUpperCase() || undefined,
            rate: Number(rate),
            minAmount: Number(minAmount),
            maxAmount: Number(maxAmount),
            isActive,
          },
        },
      });
      setSuccess('Rate saved.');
      setRate('');
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={onUpsert} className="glass-card space-y-4 p-6">
        <h3 className="text-sm font-semibold text-ink-900">Add / update rate</h3>
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Select label="Brand" value={brandId} onChange={(e) => { setBrandId(e.target.value); setCountry(''); }}>
          <option value="">Select a brand…</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>

        <Select label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">Select a country…</option>
          {brandCountries.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </Select>

        <Select label="Card type" value={cardType} onChange={(e) => setCardType(e.target.value)}>
          {CARD_TYPES.map((t) => (
            <option key={t} value={t}>{CARD_TYPE_LABELS[t]}</option>
          ))}
        </Select>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Card currency" value={cardCurrency} onChange={(e) => setCardCurrency(e.target.value)} placeholder="USD" />
          <Input label="Payout currency" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="NGN" />
        </div>

        <Input label="Rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} placeholder={`780 (${currency || 'NGN'} per ${cardCurrency || 'USD'})`} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Min amount" type="number" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
          <Input label="Max amount" type="number" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500/30"
          />
          Active
        </label>

        <Button type="submit" disabled={!brandId || !country || !rate}>Save rate</Button>
      </form>

      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-ink-900">Rates ({ratesForBrand.length})</h3>
        <ul className="mt-4 max-h-[520px] divide-y divide-ink-100 overflow-y-auto">
          {ratesForBrand.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-700">{r.brand.name}</p>
                <p className="text-xs text-ink-400">
                  {cardTypeLabel(r.cardType)} · {r.country} · {r.cardCurrency} → {r.currency}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-ink-900">{formatMoney(r.rate, r.currency)}/{r.cardCurrency}</p>
                <p className="text-xs text-ink-400">
                  <span className={r.isActive ? 'text-brand-600' : 'text-ink-400'}>
                    {r.isActive ? 'Active' : 'Inactive'}
                  </span>{' '}
                  · {r.minAmount}–{r.maxAmount}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
