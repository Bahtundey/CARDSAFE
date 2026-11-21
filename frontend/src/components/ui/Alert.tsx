import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { ReactNode } from 'react';

type Variant = 'error' | 'success' | 'info';

const styles: Record<Variant, { box: string; Icon: typeof Info }> = {
  error: { box: 'border-red-200 bg-red-50 text-red-700', Icon: AlertCircle },
  success: { box: 'border-brand-200 bg-brand-50 text-brand-800', Icon: CheckCircle2 },
  info: { box: 'border-slate-200 bg-slate-100 text-ink-600', Icon: Info },
};

export function Alert({
  variant = 'info',
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  const { box, Icon } = styles[variant];
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${box}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
