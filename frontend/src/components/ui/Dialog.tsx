'use client';

import { ReactNode, useEffect } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

/** Base modal shell: dimmed backdrop, escape-to-close, scale-in animation. */
export function Dialog({ open, onClose, children, maxWidth = 'max-w-md' }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`dialog-enter relative w-full ${maxWidth} rounded-2xl border border-ink-200 bg-surface p-6 shadow-card`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}
