"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import type { RatingCriterion } from "@/lib/db/schema";

/**
 * The scorecard (Section 7.5): 4–5 criteria as horizontal bars with an emerald
 * fill on a line track. Bars animate up from zero when scrolled into view;
 * under prefers-reduced-motion they render statically at their final width.
 */
export function ScorecardBars({ criteria }: { criteria: RatingCriterion[] }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) return; // rendered at full width directly below
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  const active = reduced || visible;

  return (
    <div ref={ref} className="space-y-4">
      {criteria.map((c) => (
        <div key={c.label}>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-sm font-medium text-ink">{c.label}</span>
            <span className="font-mono text-sm font-semibold text-pine">
              {c.score.toFixed(1)}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-line">
            <div
              className={
                "h-full rounded-full bg-emerald" +
                (reduced ? "" : " transition-[width] duration-[900ms] ease-out")
              }
              style={{ width: active ? `${(c.score / 10) * 100}%` : "0%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
