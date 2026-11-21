'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  CreditCard,
  Banknote,
  ShieldCheck,
  ReceiptText,
  Settings,
  ArrowLeft,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';

const NAV = [
  { label: 'Dashboard', href: '/admin', Icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', Icon: Users },
  { label: 'Trades', href: '/admin/trades', Icon: ArrowLeftRight },
  { label: 'Gift cards', href: '/admin/giftcards', Icon: CreditCard },
  { label: 'Withdrawals', href: '/admin/withdrawals', Icon: Banknote },
  { label: 'KYC', href: '/admin/kyc', Icon: ShieldCheck },
  { label: 'Transactions', href: '/admin/transactions', Icon: ReceiptText },
  { label: 'Settings', href: '/admin/settings', Icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner />
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    router.replace('/dashboard');
    return null;
  }

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const navLinks = () =>
    NAV.map(({ label, href, Icon }) => (
      <Link
        key={href}
        href={href}
        onClick={() => setDrawerOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
          isActive(href)
            ? 'bg-brand-50 font-semibold text-brand-700'
            : 'text-ink-500 hover:bg-ink-50 hover:text-ink-700'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </Link>
    ));

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-ink-200 bg-surface/80 px-4 py-6 md:flex">
        <div className="px-2">
          <Link href="/" aria-label="CARDSAFE home">
            <Logo />
          </Link>
        </div>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 text-xs font-medium text-ink-700 transition-colors hover:text-ink-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to app
        </Link>
        <nav className="mt-4 flex-1 space-y-1">{navLinks()}</nav>
        <div className="border-t border-ink-200 pt-4">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar?.url} name={user.name} className="h-9 w-9 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
              <p className="truncate text-xs text-ink-500">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-ink-200 bg-surface/90 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-lg p-2 text-ink-600 transition-colors hover:bg-ink-50"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" aria-label="CARDSAFE home">
            <Logo size={30} />
          </Link>
          <Link href="/dashboard" className="text-xs font-medium text-brand-600">
            Back to app
          </Link>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="dialog-enter absolute inset-y-0 left-0 flex w-72 flex-col border-r border-ink-200 bg-surface px-4 py-6 shadow-card">
            <div className="flex items-center justify-between">
              <Link href="/" aria-label="CARDSAFE home">
                <Logo />
              </Link>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-2 text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                aria-label="Close navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-ink-50 px-3 py-2 text-xs font-medium text-ink-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to app
            </Link>
            <nav className="mt-4 flex-1 space-y-1">{navLinks()}</nav>
            <div className="border-t border-ink-200 pt-4">
              <div className="flex items-center gap-3">
                <Avatar src={user.avatar?.url} name={user.name} className="h-9 w-9 text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink-900">{user.name}</p>
                  <p className="truncate text-xs text-ink-500">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
                  aria-label="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="md:pl-60">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
