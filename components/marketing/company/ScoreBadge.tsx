import { cn } from "@/lib/utils";

/** Compact mono score in a thin emerald ring — for list rows and cards. */
export function ScoreBadge({
  score,
  size = "md",
  className,
}: {
  score: number;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-emerald bg-white font-mono font-bold text-pine",
        size === "sm" ? "h-10 w-10 text-sm" : "h-12 w-12 text-base",
        className,
      )}
    >
      {score.toFixed(1)}
    </span>
  );
}
