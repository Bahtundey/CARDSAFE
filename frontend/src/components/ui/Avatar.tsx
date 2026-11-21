import { initialsOf } from '@/lib/format';

interface AvatarProps {
  src?: string | null;
  name: string;
  className?: string;
}

export function Avatar({ src, name, className = 'h-9 w-9 text-sm' }: AvatarProps) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-700 ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}
