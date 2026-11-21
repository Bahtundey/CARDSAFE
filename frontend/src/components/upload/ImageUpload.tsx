'use client';

import { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { UPLOAD_URL } from '@/lib/config';
import { getAccessToken } from '@/lib/auth-store';

export interface UploadedMedia {
  id: string;
  url: string;
  publicId: string;
}

interface ImageUploadProps {
  currentUrl?: string | null;
  onUploaded: (media: UploadedMedia) => void;
  folder?: string;
}

const MAX_SIZE = 10 * 1024 * 1024;

export function ImageUpload({ currentUrl, onUploaded, folder = 'uploads' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPEG, PNG, WebP or GIF).');
      return;
    }
    if (file.size > MAX_SIZE) {
      setError('Image must be under 10 MB.');
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);

      const token = getAccessToken();
      const res = await fetch(UPLOAD_URL, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: 'include',
        body: form,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error ?? 'Upload failed. Please try again.');
      }
      onUploaded(json.media as UploadedMedia);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-ink-200 bg-ink-50"
        aria-label="Upload profile image"
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={currentUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-ink-400">
            <Camera className="h-6 w-6" />
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-canvas/90">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </span>
        )}
      </button>

      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : 'Change image'}
        </button>
        <p className="mt-1 text-xs text-ink-400">JPEG, PNG, WebP or GIF. Max 10 MB.</p>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
