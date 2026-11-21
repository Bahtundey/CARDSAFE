'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { CountryOption, countryFlag } from '@/lib/countries';

interface CountrySelectProps {
  options: CountryOption[];
  value: string | null;
  onChange: (code: string) => void;
  placeholder?: string;
}

/**
 * Searchable, mobile-friendly country dropdown with flags. Renders a keyboard/
 * click friendly combobox and handles empty search results gracefully.
 */
export function CountrySelect({
  options,
  value,
  onChange,
  placeholder = 'Select a country…',
}: CountrySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.code === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      // Focus the search box after the panel has rendered.
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-surface/90 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
          open ? 'border-brand-500' : 'border-ink-200'
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected ? (
          <span className="flex items-center gap-2 text-ink-800">
            <span className="text-base leading-none">{countryFlag(selected.code)}</span>
            {selected.name}
          </span>
        ) : (
          <span className="text-ink-400">{placeholder}</span>
        )}
        <ChevronDown className="h-4 w-4 shrink-0 text-ink-400" />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-ink-200 bg-surface shadow-card">
          <div className="border-b border-ink-100 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search countries…"
                className="w-full rounded-lg border border-ink-200 bg-surface/90 py-2 pl-8 pr-3 text-sm text-ink-800 placeholder:text-ink-400 outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <ul role="listbox" className="max-h-64 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-ink-400">
                No countries match “{query}”.
              </li>
            ) : (
              filtered.map((o) => {
                const active = o.code === value;
                return (
                  <li key={o.code} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(o.code);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        active ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{countryFlag(o.code)}</span>
                        {o.name}
                      </span>
                      {active && <Check className="h-4 w-4" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
