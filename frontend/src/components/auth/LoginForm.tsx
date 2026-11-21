'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PasswordInput } from './PasswordInput';
import { useAuth } from '@/lib/auth-context';
import { extractErrorMessage } from '@/lib/errors';

export function LoginForm({
  initialEmail = '',
  registered = false,
}: {
  initialEmail?: string;
  registered?: boolean;
}) {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {registered && (
        <Alert variant="success">
          Account created successfully! Please log in with your registered email and password to continue.
        </Alert>
      )}
      {error && <Alert variant="error">{error}</Alert>}

      <Input
        label="Email address"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        icon={<Mail className="h-4 w-4" />}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <PasswordInput
        label="Password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" loading={submitting} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
