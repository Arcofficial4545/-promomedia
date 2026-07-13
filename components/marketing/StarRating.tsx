import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
} as const;

/**
 * Five-star rating derived from a 0–10 editorial score. A gold filled row is
 * clipped over a muted base row so fractional scores render precisely (e.g.
 * 8.8/10 → 4.4 stars). Decorative — the numeric score stays the source of truth.
 */
export function StarRating({
  score,
  size = "md",
  showValue = false,
  className,
}: {
  /** 0–10 editorial score. */
  score: number;
  size?: "sm" | "md";
  showValue?: boolean;
  className?: string;
}) {
  const outOf5 = Math.max(0, Math.min(5, score / 2));
  const pct = (outOf5 / 5) * 100;
  const star = sizeMap[size];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="img"
      aria-label={`Rated ${outOf5.toFixed(1)} out of 5 stars`}
    >
      <span className="relative inline-flex">
        {/* Muted base */}
        <span className="flex gap-0.5 text-line-strong" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={cn(star, "shrink-0")} fill="currentColor" stroke="none" />
          ))}
        </span>
        {/* Gold fill, width-clipped to the score */}
        <span
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-[#f5b301]"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={cn(star, "shrink-0")} fill="currentColor" stroke="none" />
          ))}
        </span>
      </span>
      {showValue && (
        <span className="font-mono text-xs font-semibold text-ink-muted">
          {outOf5.toFixed(1)}
        </span>
      )}
    </span>
  );
}
