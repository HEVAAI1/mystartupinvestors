import { describe, expect, it } from 'vitest';
import { calculateCommission } from '@/lib/affiliate-constants';

describe('calculateCommission', () => {
  it('takes 25% of whole dollar amounts', () => {
    expect(calculateCommission(100)).toBe(25);
    expect(calculateCommission(40)).toBe(10);
    expect(calculateCommission(4)).toBe(1);
  });

  it('rounds fractional cents to the nearest cent', () => {
    expect(calculateCommission(10.03)).toBe(2.51);
    expect(calculateCommission(9.99)).toBe(2.5);
    expect(calculateCommission(0.03)).toBe(0.01);
  });

  it('returns zero for a zero amount', () => {
    expect(calculateCommission(0)).toBe(0);
  });

  it('handles large values', () => {
    expect(calculateCommission(1_000_000)).toBe(250_000);
    expect(calculateCommission(999_999.99)).toBe(250_000);
  });

  it('never produces a commission larger than the payment amount', () => {
    const amounts = [0, 0.01, 4, 9.99, 10.03, 100, 999_999.99, 1_000_000];

    for (const amount of amounts) {
      const commissionAmount = calculateCommission(amount);
      expect(commissionAmount).toBeLessThanOrEqual(amount);
    }
  });
});
