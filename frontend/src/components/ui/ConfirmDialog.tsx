'use client';

import { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog } from '@/components/ui/Dialog';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? () => {} : onCancel}>
      <div className="flex items-start gap-4">
        {destructive && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
        )}
        <div>
          <h3 id="confirm-dialog-title" className="text-base font-semibold text-ink-900">
            {title}
          </h3>
          {description && <div className="mt-1.5 text-sm text-ink-500">{description}</div>}
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-ink-200 bg-ink-50 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-200 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={
            destructive
              ? 'rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50'
              : 'rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50'
          }
        >
          {loading ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
