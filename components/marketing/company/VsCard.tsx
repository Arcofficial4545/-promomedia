import Link from "next/link";
import { StoreLogo } from "@/components/coupon/StoreLogo";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { ComparisonWithStores } from "@/lib/db/repositories/comparisons";

/** Matchup card for the /compare hub. `featured` renders the large hero VS. */
export function VsCard({
  comparison: c,
  featured = false,
}: {
  comparison: ComparisonWithStores;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/compare/${c.slug}`}
      className={cn(
        "group flex flex-col rounded-[var(--radius-card)] border border-line bg-white transition-shadow hover:shadow-md",
        featured ? "p-6 sm:p-10" : "p-5",
      )}
    >
      <div className="flex items-center justify-center gap-4 sm:gap-6">
        <Side store={c.storeA} showScore={featured} />
        <span
          className={cn(
            "font-mono font-bold text-ink-subtle",
            featured ? "text-lg" : "text-sm",
          )}
          aria-hidden="true"
        >
          VS
        </span>
        <Side store={c.storeB} showScore={featured} />
      </div>

      <h3
        className={cn(
          "mt-5 text-center font-display font-bold tracking-tight text-ink group-hover:text-pine",
          featured ? "text-2xl sm:text-3xl" : "text-lg",
        )}
      >
        {c.title}
      </h3>
      <p
        className={cn(
          "mx-auto mt-2 max-w-xl text-center text-ink-muted",
          featured ? "text-body-lg" : "line-clamp-2 text-sm",
        )}
      >
        {c.subtitle}
      </p>
      <p className="mt-4 text-center font-mono text-xs text-ink-subtle">
        Updated {formatDate(c.updatedAt)}
      </p>
    </Link>
  );
}

function Side({
  store,
  showScore,
}: {
  store: ComparisonWithStores["storeA"];
  showScore: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <StoreLogo
        name={store.name}
        logoUrl={store.logoUrl}
        themeColor={store.themeColor}
        size={showScore ? "lg" : "md"}
      />
      <span className="max-w-[7rem] truncate text-center text-sm font-semibold text-ink">
        {store.name}
      </span>
      {showScore && store.editorialScore !== null && (
        <span className="font-mono text-sm font-bold text-pine">
          {store.editorialScore.toFixed(1)}
          <span className="text-ink-subtle">/10</span>
        </span>
      )}
    </div>
  );
}
