import { describe, expect, it, vi } from 'vitest';
import { runExclusive } from '@/hooks/useCalculationSubmission';

describe('runExclusive', () => {
  it('ignores a second call while the first is still pending', async () => {
    const lockRef = { current: false };
    const setPending = vi.fn();
    let resolveFirst: () => void;
    const firstCallStarted = new Promise<void>((resolve) => {
      resolveFirst = resolve;
    });

    const first = runExclusive(
      lockRef,
      () =>
        new Promise<string>((resolve) => {
          resolveFirst();
          setTimeout(() => resolve('first'), 10);
        }),
      setPending
    );

    await firstCallStarted;
    expect(lockRef.current).toBe(true);

    const second = runExclusive(lockRef, async () => 'second', setPending);

    expect(await second).toBeUndefined();
    expect(await first).toBe('first');
  });

  it('releases the lock after completion so a subsequent call works', async () => {
    const lockRef = { current: false };
    const setPending = vi.fn();

    const result1 = await runExclusive(lockRef, async () => 'ok', setPending);
    expect(result1).toBe('ok');
    expect(lockRef.current).toBe(false);

    const result2 = await runExclusive(lockRef, async () => 'ok again', setPending);
    expect(result2).toBe('ok again');
    expect(setPending).toHaveBeenCalledWith(true);
    expect(setPending).toHaveBeenLastCalledWith(false);
  });

  it('releases the lock even when the wrapped function throws', async () => {
    const lockRef = { current: false };
    const setPending = vi.fn();

    await expect(
      runExclusive(
        lockRef,
        async () => {
          throw new Error('boom');
        },
        setPending
      )
    ).rejects.toThrow('boom');

    expect(lockRef.current).toBe(false);

    const result = await runExclusive(lockRef, async () => 'recovered', setPending);
    expect(result).toBe('recovered');
  });
});
