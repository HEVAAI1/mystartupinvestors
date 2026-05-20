/** Run work after first paint without blocking the main thread. */
export function scheduleIdleWork(
  work: () => void,
  options?: { timeoutMs?: number; fallbackDelayMs?: number }
): () => void {
  const timeout = options?.timeoutMs ?? 2000;
  const fallbackDelay = options?.fallbackDelayMs ?? 300;

  if (typeof window === "undefined") {
    work();
    return () => {};
  }

  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(work, { timeout });
    return () => window.cancelIdleCallback(id);
  }

  const id = globalThis.setTimeout(work, fallbackDelay);
  return () => globalThis.clearTimeout(id);
}
