"use client";

import { useCallback, useRef, useState } from "react";

/**
 * Runs `fn` only if `lockRef` isn't already held. Exported (pure, no React
 * dependency) so the single-flight guard can be unit-tested without
 * mounting a component. A ref (not state) is required for the lock itself:
 * state updates are async and a second click before re-render would still
 * see the old value, letting two requests through.
 */
export async function runExclusive<T>(
    lockRef: { current: boolean },
    fn: () => Promise<T> | T,
    setPending: (value: boolean) => void
): Promise<T | undefined> {
    if (lockRef.current) return undefined;
    lockRef.current = true;
    setPending(true);
    try {
        return await fn();
    } finally {
        lockRef.current = false;
        setPending(false);
    }
}

/**
 * Wraps a calculator's submit handler so a double-click (or any re-entrant
 * call while a request is in flight) can't fire twice and burn two credits.
 * Returns `isSubmitting` for UI (disable the button, show "Calculating…")
 * and `submit`, the guarded version of the handler to wire to onClick.
 */
export function useCalculationSubmission<Args extends unknown[]>(
    submitFn: (...args: Args) => Promise<void> | void
) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const pendingRef = useRef(false);

    const submit = useCallback(
        (...args: Args) => runExclusive(pendingRef, () => submitFn(...args), setIsSubmitting),
        [submitFn]
    );

    return { isSubmitting, submit };
}
