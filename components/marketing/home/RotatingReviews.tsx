"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StoreLogo } from "@/components/coupon/StoreLogo";
import { ScoreBadge } from "@/components/marketing/company/ScoreBadge";
import { StarRating } from "@/components/marketing/StarRating";
import { Reveal } from "@/components/motion/Reveal";

export type ReviewItem = {
  id: string;
  slug: string;
  name: string;
  categoryName: string | null;
  logoUrl: string | null;
  themeColor: string | null;
  editorialScore: number | null;
  verdict: string | null;
  updatedLabel: string | null;
};

/** Fisher–Yates shuffle over a copy — never mutate the source array. */
function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The "Latest reviews" list, spotlighting three reviews that rotate on every
 * visit. Cached page → SSR shows the first three; the browser reshuffles on
 * mount so it changes each refresh without a database hit.
 */
export function RotatingReviews({ reviews }: { reviews: ReviewItem[] }) {
  const [picked, setPicked] = useState(() => reviews.slice(0, 3));

  useEffect(() => {
    setPicked(shuffle(reviews).slice(0, 3));
  }, [reviews]);

  return (
    <ul className="mt-8 divide-y divide-line border-y border-line">
      {picked.map((store, i) => (
        <Reveal as="li" key={store.id} delay={Math.min(i, 2) * 0.06}>
          <Link
            href={`/tools/${store.slug}`}
            className="group flex items-center gap-4 py-5 transition-colors hover:bg-mint/40 sm:gap-5"
          >
            <StoreLogo
              name={store.name}
              logoUrl={store.logoUrl}
              themeColor={store.themeColor}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-display text-lg font-semibold text-ink group-hover:text-pine">
                  {store.name}
                </span>
                {store.categoryName && <Badge>{store.categoryName}</Badge>}
              </div>
              {store.editorialScore !== null && (
                <StarRating
                  score={store.editorialScore}
                  size="sm"
                  className="mt-1.5"
                />
              )}
              {store.verdict && (
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-muted">
                  {store.verdict}
                </p>
              )}
              {store.updatedLabel && (
                <p className="mt-1.5 font-mono text-xs text-ink-subtle">
                  Updated {store.updatedLabel}
                </p>
              )}
            </div>
            {store.editorialScore !== null && (
              <ScoreBadge score={store.editorialScore} />
            )}
            <ArrowRight
              className="hidden h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-pine sm:block"
              aria-hidden="true"
            />
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
