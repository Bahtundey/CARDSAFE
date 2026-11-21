export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="cardsafe-mark" x1="5" y1="3" x2="35" y2="37" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8A33" />
          <stop offset="1" stopColor="#E85D04" />
        </linearGradient>
      </defs>
      <path
        d="M20 2.5 L35.5 8 V19 C35.5 28.5 29.5 34.5 20 37.5 C10.5 34.5 4.5 28.5 4.5 19 V8 Z"
        fill="url(#cardsafe-mark)"
      />
      <rect x="12" y="14" width="16" height="11" rx="2.5" fill="#111111" />
      <path
        d="M14.5 20 H25.5 M14.5 23.2 H22"
        stroke="#FF8A33"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({ size = 36, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      {withText && (
        <span className="text-lg font-bold tracking-tight text-ink-900">
          CARD<span className="gradient-text">SAFE</span>
        </span>
      )}
    </div>
  );
}
