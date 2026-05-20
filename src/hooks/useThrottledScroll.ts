"use client";

import { useEffect, useState } from "react";

/** Throttled scroll — same scrolled/not-scrolled UI, fewer re-renders while scrolling. */
export function useThrottledScroll(threshold = 20, throttleMs = 100) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const update = () => {
      const y = window.scrollY;
      setScrolled((prev) => {
        const next = y > threshold;
        return prev === next ? prev : next;
      });
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      timeoutId = setTimeout(update, throttleMs);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [threshold, throttleMs]);

  return scrolled;
}
