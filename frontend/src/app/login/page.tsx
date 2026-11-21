import Link from 'next/link';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { registered?: string; email?: string };
}) {
  const registered = searchParams?.registered === '1';
  const initialEmail = searchParams?.email ?? '';

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your cards, trades and wallet."
      footer={
        <>
          New to CARDSAFE?{' '}
          <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm initialEmail={initialEmail} registered={registered} />
    </AuthLayout>
  );
}
