'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white font-semibold hover:bg-brand-700 shadow-glow disabled:hover:bg-brand-600',
  secondary:
    'bg-ink-50 text-ink-800 border border-ink-200 hover:bg-ink-200 disabled:hover:bg-ink-50',
  ghost: 'bg-transparent text-ink-600 hover:bg-ink-50 hover:text-ink-900',
  danger: 'bg-red-600 text-white font-semibold hover:bg-red-700',
};

export function Button({
  variant = 'primary',
  loading = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
