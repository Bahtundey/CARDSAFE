'use client';

import { useRef, useState, useCallback, DragEvent } from 'react';
import { UploadCloud, X, RefreshCw, ImageIcon, CheckCircle2 } from 'lucide-react';
import { UploadedMedia } from '@/lib/graphql/operations';
import { uploadImageWithProgress } from '@/lib/upload';
import { getAccessToken } from '@/lib/auth-store';

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface DragDropUploadProps {
  folder?: string;
  onUploaded: (media: UploadedMedia) => void;
  onClear?: () => void;
}

export function DragDropUpload({ folder = 'gift-cards', onUploaded, onClear }: DragDropUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(file: File): string | null {
    if (!ALLOWED.includes(file.type)) {
      return 'Unsupported file type. Use JPEG, PNG, WebP or GIF.';
    }
    if (file.size > MAX_SIZE) {
      return 'Image must be under 10 MB.';
    }
    return null;
  }

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const validationError = validate(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setPreview(URL.createObjectURL(file));
      setFileName(file.name);
      setDone(false);
      setUploading(true);
      setProgress(0);

      const token = getAccessToken();
      if (!token) {
        setError('Your session has expired. Please sign in again.');
        setUploading(false);
        return;
      }

      try {
        const media = await uploadImageWithProgress(file, folder, token, setProgress);
        setDone(true);
        setUploading(false);
        onUploaded(media);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
        setUploading(false);
      }
    },
    [folder, onUploaded]
  );

  function reset() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName(null);
    setProgress(0);
    setDone(false);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
    onClear?.();
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {preview ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-ink-200 sm:w-56">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Card preview" className="h-full w-full object-cover" />
            {done && (
              <span className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
                <CheckCircle2 className="h-3.5 w-3.5" /> Uploaded
              </span>
            )}
          </div>

          <div className="flex-1">
            <p className="truncate text-sm font-medium text-ink-700">{fileName}</p>

            {uploading && (
              <div className="mt-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-ink-50">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-ink-500">Uploading… {progress}%</p>
              </div>
            )}

            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-200 disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Replace
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 bg-ink-50 px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-200 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragActive
              ? 'border-brand-500 bg-brand-50'
              : 'border-ink-200 bg-surface/70 hover:border-ink-300'
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            {uploading ? <RefreshCw className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
          </span>
          <p className="mt-4 text-sm font-medium text-ink-700">
            Drag &amp; drop your gift card image
          </p>
          <p className="mt-1 text-xs text-ink-400">
            or <span className="font-semibold text-brand-600">browse files</span> · JPEG, PNG, WebP, GIF · max 10 MB
          </p>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </button>
      )}
    </div>
  );
}
