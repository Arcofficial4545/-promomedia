"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export type Matchup = {
  title: string;
  subtitle: string;
  slug: string;
  storeAName: string;
  storeBName: string;
  criteria: { label: string; winner: "a" | "b" | "tie" }[];
};

/**
 * Head-to-head band that rotates its matchup on every visit. The page is
 * cached, so the server renders the first matchup (stable, SEO-visible) and the
 * browser swaps in a random one on mount — no per-request database hit.
 */
export function FeaturedComparison({ matchups }: { matchups: Matchup[] }) {
  const [featured, setFeatured] = useState<Matchup | null>(
    () => matchups[0] ?? null,
  );

  useEffect(() => {
    if (matchups.length === 0) return;
    setFeatured(matchups[Math.floor(Math.random() * matchups.length)]);
  }, [matchups]);

  if (!featured) return null;

  return (
    <Section tone="pine">
      <Container size="wide">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.2em] text-mint/70 uppercase">
              Head-to-head
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {featured.title}
            </h2>
            <p className="mt-3 max-w-md text-body-lg text-mint/85">
              {featured.subtitle}
            </p>
            <Link
              href={`/compare/${featured.slug}`}
              className="btn-gloss btn-primary press-down mt-6 inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] px-6 text-sm font-semibold"
            >
              See the full comparison
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {/* Mini table preview */}
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-white/15 bg-white/[0.04]">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-white/10 px-5 py-3 font-mono text-xs tracking-wider text-mint/60 uppercase">
              <span>Criterion</span>
              <span className="text-center">{featured.storeAName}</span>
              <span className="text-center">{featured.storeBName}</span>
            </div>
            {featured.criteria.slice(0, 4).map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-white/10 px-5 py-3 text-sm text-white/85 last:border-0"
              >
                <span>{row.label}</span>
                <span className="w-16 text-center">
                  {row.winner === "a" ? (
                    <span className="font-semibold text-emerald">Wins</span>
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </span>
                <span className="w-16 text-center">
                  {row.winner === "b" ? (
                    <span className="font-semibold text-emerald">Wins</span>
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
