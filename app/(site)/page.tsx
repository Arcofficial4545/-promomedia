import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CouponGrid } from "@/components/coupon/CouponGrid";
import { toTicketCoupon } from "@/components/coupon/toTicketCoupon";
import { StoreLogo } from "@/components/coupon/StoreLogo";
import { CategoryIcon } from "@/components/marketing/CategoryIcon";
import { Hero } from "@/components/marketing/hero/Hero";
import { LogoMarquee } from "@/components/marketing/LogoMarquee";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import { ScoreBadge } from "@/components/marketing/company/ScoreBadge";
import { StarRating } from "@/components/marketing/StarRating";
import { Reveal } from "@/components/motion/Reveal";
import { PromoSlot } from "@/components/promo/PromoSlot";
import { listPublishedComparisons } from "@/lib/db/repositories/comparisons";
import { listCategories } from "@/lib/db/repositories/categories";
import {
  countActiveCoupons,
  listActiveCoupons,
} from "@/lib/db/repositories/coupons";
import { listPublishedPosts } from "@/lib/db/repositories/posts";
import { listReviewedStores } from "@/lib/db/repositories/stores";
import { formatDate } from "@/lib/utils";

// Rendered per request so the "Latest reviews" spotlight rotates on every
// visit instead of serving a cached, identical selection.
export const dynamic = "force-dynamic";

/** Fisher–Yates shuffle over a copy — never mutate the source array. */
function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Kicker + left-aligned title, with an optional trailing link. */
function SectionHead({
  kicker,
  title,
  description,
  href,
  linkLabel,
}: {
  kicker: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs font-semibold tracking-[0.2em] text-ink-subtle uppercase">
          {kicker}
        </p>
        <h2 className="mt-1.5 font-display text-3xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-xl text-ink-muted">{description}</p>
        )}
      </div>
      {href && linkLabel && (
        <Button href={href} variant="secondary" size="sm">
          {linkLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}

export default async function HomePage() {
  const [
    { coupons: featuredCoupons },
    couponCount,
    categories,
    { posts: latestPosts },
    reviewedStores,
    comparisons,
  ] = await Promise.all([
    listActiveCoupons({ sort: "featured", limit: 4 }),
    countActiveCoupons(),
    listCategories(),
    listPublishedPosts({ limit: 2 }),
    listReviewedStores(),
    listPublishedComparisons(),
  ]);

  // Everything below rotates on each visit (the page is force-dynamic), so the
  // hero chips and the head-to-head band never look static on refresh.
  const shuffledComparisons = shuffle(comparisons);
  const featuredComparison = shuffledComparisons[0] ?? null;

  // Rotate which three reviews get the home spotlight on each visit.
  const topReviews = shuffle(reviewedStores).slice(0, 3);
  // Floating score chips: a random three of the scored tools.
  const heroCards = shuffle(
    reviewedStores.filter((s) => s.editorialScore !== null),
  )
    .slice(0, 3)
    .map((s) => ({
      name: s.name,
      score: s.editorialScore as number,
      logoUrl: s.logoUrl,
    }));
  // Floating VS chips: two matchups other than the one in the featured band.
  const heroVsChips = shuffledComparisons.slice(1, 3).map((c) => ({
    a: c.storeA.name,
    b: c.storeB.name,
    slug: c.slug,
  }));
  // Quick tags: the featured matchup + top categories, all real deep links.
  const quickTags = [
    ...(featuredComparison
      ? [
          {
            label: featuredComparison.title,
            href: `/compare/${featuredComparison.slug}`,
          },
        ]
      : []),
    ...categories
      .slice(0, 3)
      .map((c) => ({ label: c.name, href: `/categories/${c.slug}` })),
  ];

  return (
    <>
      <Hero
        toolsReviewed={reviewedStores.length}
        comparisonsCount={comparisons.length}
        dealsCount={couponCount}
        cards={heroCards}
        vsChips={heroVsChips}
        quickTags={quickTags}
      />

      <LogoMarquee
        logos={reviewedStores.map((s) => ({
          name: s.name,
          logoUrl: s.logoUrl,
        }))}
      />

      <Container size="wide" className="mt-10">
        <PromoSlot placement="home-banner" path="/" />
      </Container>

      {/* ============================================= Latest reviews (rows) */}
      {topReviews.length > 0 && (
        <Section>
          <Container size="wide">
            <Reveal>
              <SectionHead
                kicker="Latest reviews"
                title="Read the trade-offs first"
                description="Independent, scored editorial coverage — the verdict states the catch, not just the praise."
                href="/reviews"
                linkLabel="All reviews"
              />
            </Reveal>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {topReviews.map((store, i) => (
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
                        {store.categories[0] && (
                          <Badge>{store.categories[0].name}</Badge>
                        )}
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
                      {store.lastReviewedAt && (
                        <p className="mt-1.5 font-mono text-xs text-ink-subtle">
                          Updated {formatDate(store.lastReviewedAt)}
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
          </Container>
        </Section>
      )}

      {/* ==================================== Featured comparison (pine band) */}
      {featuredComparison && (
        <Section tone="pine">
          <Container size="wide">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="font-mono text-xs font-semibold tracking-[0.2em] text-mint/70 uppercase">
                  Head-to-head
                </p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {featuredComparison.title}
                </h2>
                <p className="mt-3 max-w-md text-body-lg text-mint/85">
                  {featuredComparison.subtitle}
                </p>
                <Link
                  href={`/compare/${featuredComparison.slug}`}
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
                  <span className="text-center">
                    {featuredComparison.storeA.name}
                  </span>
                  <span className="text-center">
                    {featuredComparison.storeB.name}
                  </span>
                </div>
                {featuredComparison.criteria.slice(0, 4).map((row, i) => (
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
      )}

      {/* ------------------------------------------- Browse by category (rows) */}
      <Section>
        <Container size="wide">
          <Reveal>
            <SectionHead
              kicker="Categories"
              title="Browse by what you're shopping for"
            />
          </Reveal>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="group flex items-center gap-4 py-4 transition-colors hover:bg-mint/40"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint text-pine">
                    <CategoryIcon name={category.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold text-ink group-hover:text-pine">
                      {category.name}
                    </p>
                    <p className="text-sm text-ink-muted">
                      {category.description}
                    </p>
                  </div>
                  <span className="hidden shrink-0 font-mono text-xs text-ink-subtle sm:block">
                    {category.storeCount}{" "}
                    {category.storeCount === 1 ? "tool" : "tools"}
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-pine"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ============================================= Deals strip (secondary) */}
      <Section tone="mint" padding="tight">
        <Container size="wide">
          <SectionHead
            kicker="Deals"
            title="A few worth grabbing"
            href="/deals"
            linkLabel="All deals"
          />
          <CouponGrid
            coupons={featuredCoupons.map(toTicketCoupon)}
            className="mt-6"
          />
        </Container>
      </Section>

      {/* ------------------------------------------ From the blog (2 wide) */}
      {latestPosts.length > 0 && (
        <Section>
          <Container size="wide">
            <Reveal>
              <SectionHead
                kicker="From the blog"
                title="HAVE A LOOK AT OUR LATEST ARTICLES"
                href="/blog"
                linkLabel="All articles"
              />
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {latestPosts.map((post, i) => (
                <Reveal key={post.id} delay={i * 0.08}>
                  <Card
                    interactive
                    className="relative flex h-full flex-col p-6 sm:p-7"
                  >
                    <p className="font-mono text-xs text-ink-subtle">
                      {post.publishedAt ? formatDate(post.publishedAt) : ""}
                      {post.category ? ` · ${post.category.name}` : ""}
                      {` · ${post.readingMinutes} min read`}
                    </p>
                    <h3 className="mt-3 font-display text-2xl leading-snug font-semibold text-ink">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="after:absolute after:inset-0"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-3 line-clamp-3 text-ink-muted">
                      {post.excerpt}
                    </p>
                    <p className="mt-auto pt-5 text-sm font-semibold text-pine">
                      Read article
                    </p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* ---------------------------------------------- Newsletter band */}
      <Section tone="pine" padding="default">
        <Container className="flex flex-col items-center text-center">
          <Reveal>
            <h2 className="max-w-xl font-display text-3xl font-bold text-white">
              The tools worth your money
            </h2>
            <p className="mx-auto mt-3 max-w-md text-mint/85">
              One email a week — the latest reviews, comparisons, and deals
              worth knowing about. No noise, unsubscribe anytime.
            </p>
            <div className="mt-7 flex justify-center">
              <NewsletterForm source="home-band" />
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
