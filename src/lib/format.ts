import type { ShoppingItem } from '@/types/shopping';

export const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Groups thousands with a non-breaking space: 2450 → "2 450". */
export const formatNumber = (value: number): string =>
  Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** "~1 200 ₴" */
export const formatMoney = (value: number, approx = true): string =>
  `${approx ? '~' : ''}${formatNumber(value)} ₴`;

/** Quantity without trailing zeros: 0.5, 2, 1.25 */
export const formatQuantity = (value: number): string =>
  Number.isInteger(value) ? String(value) : String(Math.round(value * 1000) / 1000).replace('.', ',');

export const itemTotal = (item: ShoppingItem): number =>
  (item.estimatedPrice ?? 0) * item.quantity;

export const sumItems = (items: ShoppingItem[]): number =>
  items.reduce((acc, item) => acc + itemTotal(item), 0);

export const formatDate = (timestamp: number): string =>
  new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(timestamp);

export const formatWeekday = (timestamp: number): string =>
  new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(timestamp);

/** Parses user input like "12,5" → 12.5; empty/invalid → undefined. */
export const parseDecimal = (raw: string): number | undefined => {
  const n = Number.parseFloat(raw.replace(',', '.').replace(/\s/g, ''));
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

export const pluralItems = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'товар';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'товара';
  return 'товаров';
};
