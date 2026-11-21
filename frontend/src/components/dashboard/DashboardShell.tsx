'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Tag,
  ArrowLeftRight,
  Wallet,
  Banknote,
  Settings,
  ShieldCheck,
  UserCog,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  Menu,
  X,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { AuthUser } from '@/lib/graphql/operations';
import { useAuth } from '@/lib/auth-context';

interface NavItem {
  label: string;
  href: string;
  Icon: typeof LayoutDashboard;
}

export function DashboardShell({ user, children }: { user: AuthUser; children: ReactNode }) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const NAV: NavItem[] = [
    { label: 'Overview', href: '/dashboard', Icon: LayoutDashboard },
    { label: 'Trade', href: '/dashboard/trade', Icon: Tag },
    { label: 'My trades', href: '/dashboard/trades', Icon: ArrowLeftRight },
    { label: 'Wallet', href: '/dashboard/wallet', Icon: Wallet },
    { label: 'Withdrawals', href: '/dashboard/withdrawals', Icon: Banknote },
    { label: 'KYC', href: '/dashboard/kyc', Icon: ShieldCheck },
    { label: 'Settings', href: '/dashboard/settings', Icon: Settings },
    ...(user.role === 'ADMIN' ? [{ label: 'Admin', href: '/admin', Icon: UserCog }] : []),
  ];

  function isActive(href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  const navLinks = (compact: boolean) =>
    NAV.map(({ label, href, Icon }) => (
      <Link
        key={href}
        href={href}
        onClick={() => setDrawerOpen(false)}
        title={compact ? label : undefined}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
          compact ? 'justify-center' : ''
        } ${
          isActive(href)
            ? 'bg-brand-50 font-semibold text-brand-700'
            : 'text-ink-500 hover:bg-ink-50 hover:text-ink-700'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!compact && <span>{label}</span>}
      </Link>
    ));

  return (
    <div className="min-h-screen bg-canvas">
      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-ink-200 bg-surface/80 px-4 py-6 transition-[width] duration-200 md:flex ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-1`}>
          <Link href="/" aria-label="CARDSAFE home">
            <Logo size={32} withText={!collapsed} />
          </Link>
          {!collapsed && <NotificationsDropdown />}
        </div>

        <nav className={`mt-8 flex-1 space-y-1 ${collapsed ? 'px-0' : ''}`}>
          {navLinks(collapsed)}
        </nav>

        <div className="border-t border-ink-200 pt-4">
          {collapsed ? (
            <div className="flex flex-col items-center gap-3">
              <NotificationsDropdown />
              <Avatar src={user.avatar?.url} name={user.name} className="h-9 w-9 text-sm" />
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
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
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="mt-4 flex items-center justify-center rounded-lg border border-ink-200 py-2 text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile header */}
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
          <div className="flex items-center gap-1">
            <NotificationsDropdown />
            <Avatar src={user.avatar?.url} name={user.name} className="h-8 w-8 text-xs" />
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
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
            <nav className="mt-6 flex-1 space-y-1">{navLinks(false)}</nav>
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

      {/* Main content */}
      <div className={`transition-[padding] duration-200 ${collapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
