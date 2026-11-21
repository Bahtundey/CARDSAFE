export interface CountryOption {
  code: string;
  name: string;
}

/**
 * Emoji flag derived from an ISO 3166-1 alpha-2 country code, used by the
 * searchable country dropdown. Purely presentational.
 */
export function countryFlag(code: string): string {
  const cc = code.toUpperCase();
  // Regional-indicator symbols start at U+1F1E6 (A).
  const A = 0x1f1e6;
  const offset = 'A'.charCodeAt(0);
  return Array.from(cc)
    .filter((ch) => ch >= 'A' && ch <= 'Z')
    .map((ch) => String.fromCodePoint(A + ch.charCodeAt(0) - offset))
    .join('');
}
