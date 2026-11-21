'use client';

import { useState } from 'react';

interface SafeImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
}

/**
 * Renders an image with graceful fallback for missing URLs and broken images.
 * Never exposes a raw error — falls back to a branded monogram tile.
 */
export function SafeImage({ src, alt, className = '', fallbackText }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-brand-50 text-sm font-semibold text-brand-700`}
        role="img"
        aria-label={alt}
      >
        {fallbackText ?? alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
