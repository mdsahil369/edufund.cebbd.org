/**
 * Currency rules for the whole site.
 *
 * Every amount is stored in Supabase as BDT (the canonical currency). The site
 * shows US dollars by default, with the BDT equivalent alongside prominent
 * figures. One fixed display rate keeps USD and BDT prices consistent with the
 * support plans the client agreed on (e.g. $17 ≈ ৳2,100).
 */

/** Fixed display rate. Update here only — the database keeps BDT values. */
export const USD_TO_BDT = 123;

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const bdtFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

/** Convert a BDT amount to whole US dollars. */
export function toUsd(amountInBdt: number): number {
  if (!Number.isFinite(amountInBdt)) return 0;
  return Math.round(amountInBdt / USD_TO_BDT);
}

/** Convert a USD amount to BDT. */
export function toBdt(amountInUsd: number): number {
  if (!Number.isFinite(amountInUsd)) return 0;
  return Math.round(amountInUsd * USD_TO_BDT);
}

/** `$17` — primary currency used everywhere on the site. */
export function formatUSD(amountInBdt: number): string {
  return usdFormatter.format(toUsd(amountInBdt));
}

/** `৳ 2,100` — secondary currency. */
export function formatBDT(amount: number, withSymbol = true): string {
  const value = bdtFormatter.format(Math.round(amount || 0));
  return withSymbol ? `৳ ${value}` : value;
}

/** `$17 (≈ ৳2,100)` — USD primary with the BDT equivalent. */
export function formatMoney(amountInBdt: number): string {
  return `${formatUSD(amountInBdt)} (≈ ${formatBDT(amountInBdt)})`;
}

/** Compact totals for charts and stat cards. */
export function formatCompactMoney(amountInBdt: number): string {
  return formatUSD(amountInBdt);
}

/** Monthly sponsorship tiers, kept in sync with the database seed. */
export const MONTHLY_TIERS: { amountBdt: number; label: string }[] = [
  { amountBdt: 2100, label: "Full support" },
  { amountBdt: 1600, label: "Partial support" },
  { amountBdt: 1100, label: "Partial support" },
];

/** One-time donations cannot be smaller than this (also enforced server-side). */
export const MIN_ONE_TIME_BDT = 1000;
