'use client';

import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, children, className = '', ...props },
  ref
) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-ink-600">{label}</span>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none rounded-xl border bg-surface/90 px-3.5 py-2.5 pr-9 text-sm text-ink-800 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
            error ? 'border-red-400' : 'border-ink-200'
          } ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      </div>
      {error && <span className="mt-1.5 block text-xs text-red-600">{error}</span>}
    </label>
  );
});
