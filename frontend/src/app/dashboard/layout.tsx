'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui/Spinner';
import { Logo } from '@/components/ui/Logo';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-canvas">
        <Logo />
        <Spinner />
        <p className="text-sm text-ink-400">Loading your dashboard…</p>
      </div>
    );
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
