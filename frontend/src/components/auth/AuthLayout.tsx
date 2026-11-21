'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Lock } from 'lucide-react';
import { Logo, LogoMark } from '@/components/ui/Logo';

const FEATURES = [
  { Icon: ShieldCheck, title: 'Escrow protected', text: 'Funds are held safely until every card is verified.' },
  { Icon: Zap, title: 'Instant payouts', text: 'Receive payment the moment your card checks out.' },
  { Icon: Lock, title: 'Bank-grade security', text: 'Two-factor auth and encrypted vault storage.' },
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-surface p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-radial-fade" aria-hidden="true" />
        <div className="relative">
          <Link href="/" aria-label="CARDSAFE home">
            <Logo />
          </Link>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-ink-900">
            Trade gift cards with <span className="gradient-text">confidence</span>.
          </h2>
          <p className="mt-3 text-ink-500">
            The secure marketplace where verified buyers and sellers exchange value in minutes.
          </p>

          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{title}</p>
                  <p className="text-sm text-ink-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-ink-400">
          © {new Date().getFullYear()} CARDSAFE. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-canvas px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Link href="/" aria-label="CARDSAFE home">
              <Logo />
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-ink-900">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
