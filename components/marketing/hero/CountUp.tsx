"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import { formatNumber } from "@/lib/utils";

type CountUpProps = {
  value: number;
  durationMs?: number;
  className?: string;
};

/** Counts from 0 to `value` on mount. Instant under reduced motion. */
export function CountUp({ value, durationMs = 1400, className }: CountUpProps) {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reducedMotion || startedRef.current) return;
    startedRef.current = true;

    let raf = 0;
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs, reducedMotion]);

  // Reduced motion: render the final value directly, no animation state.
  return (
    <span className={className}>
      {formatNumber(reducedMotion ? value : display)}
    </span>
  );
}
