/** Minimum USD balance and per-request amount for affiliate withdrawals */
export const MIN_AFFILIATE_WITHDRAWAL_USD = 75;

/** Share of a payment amount paid out to the referring affiliate */
export const AFFILIATE_COMMISSION_RATE = 0.25;

/** Commission owed on a payment, rounded to the nearest cent */
export function calculateCommission(amount: number): number {
  return Math.round(amount * AFFILIATE_COMMISSION_RATE * 100) / 100;
}
