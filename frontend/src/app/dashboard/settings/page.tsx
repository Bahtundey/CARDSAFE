'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { UPDATE_PROFILE_MUTATION } from '@/lib/graphql/operations';
import { useAuth } from '@/lib/auth-context';
import { updateSessionUser } from '@/lib/auth-store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ImageUpload, UploadedMedia } from '@/components/upload/ImageUpload';
import { extractErrorMessage } from '@/lib/errors';
import { PageHeader } from '@/components/shared/PageHeader';

type Feedback = { type: 'success' | 'error'; message: string } | null;

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [updateProfile] = useMutation(UPDATE_PROFILE_MUTATION);

  if (!user) return null;

  async function saveName() {
    setSaving(true);
    setFeedback(null);
    try {
      const { data } = await updateProfile({ variables: { input: { name: name.trim() } } });
      updateSessionUser(data.updateProfile);
      setFeedback({ type: 'success', message: 'Profile updated.' });
    } catch (err) {
      setFeedback({ type: 'error', message: extractErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  async function onAvatarUploaded(media: UploadedMedia) {
    setFeedback(null);
    try {
      const { data } = await updateProfile({ variables: { input: { avatarId: media.id } } });
      updateSessionUser(data.updateProfile);
      setFeedback({ type: 'success', message: 'Profile image updated.' });
    } catch (err) {
      setFeedback({ type: 'error', message: extractErrorMessage(err) });
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader title="Settings" description="Manage your profile and account details." />

      {feedback && <Alert variant={feedback.type}>{feedback.message}</Alert>}

      <section className="glass-card p-6">
        <h2 className="text-base font-semibold text-ink-900">Profile</h2>
        <div className="mt-6 space-y-6">
          <ImageUpload currentUrl={user.avatar?.url} folder="avatars" onUploaded={onAvatarUploaded} />
          <div>
            <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <div className="mt-3">
              <Button onClick={saveName} loading={saving} disabled={!name.trim() || name.trim() === user.name}>
                Save changes
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-6">
        <h2 className="text-base font-semibold text-ink-900">Account</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-500">Email</span>
            <span className="font-medium text-ink-700">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-500">Role</span>
            <span className="font-medium text-ink-700">{user.role === 'ADMIN' ? 'Administrator' : 'Member'}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
