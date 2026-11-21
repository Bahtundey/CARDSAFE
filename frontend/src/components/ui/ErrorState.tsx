import { ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorState({
  title = 'Something went wrong',
  description,
  retry,
}: {
  title?: string;
  description?: string;
  retry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/60 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>}
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-surface px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      )}
    </div>
  );
}

export function LoadingState({ rows = 4, className = 'h-16' }: { rows?: number; className?: string }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`glass-card animate-pulse ${className}`} />
      ))}
    </div>
  );
}
