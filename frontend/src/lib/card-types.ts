export const CARD_TYPES = ['PHYSICAL', 'E_CODE'] as const;
export type CardType = (typeof CARD_TYPES)[number];

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  PHYSICAL: 'Physical Card',
  E_CODE: 'E-code',
};

/** Human-friendly label for a card type value, tolerant of legacy spellings. */
export function cardTypeLabel(value: string): string {
  const v = value?.trim().toLowerCase();
  if (v === 'physical') return 'Physical Card';
  if (v === 'e-code' || v === 'ecode' || v === 'e_code') return 'E-code';
  return value;
}

export function isEcode(value: string): boolean {
  const v = value?.trim().toLowerCase();
  return v === 'e-code' || v === 'ecode' || v === 'e_code';
}
