import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CouponGrid } from "@/components/coupon/CouponGrid";
import { toTicketCoupon } from "@/components/coupon/toTicketCoupon";
import { CategoryIcon } from "@/components/marketing/CategoryIcon";
import { Hero } from "@/components/marketing/hero/Hero";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import { StoreCard } from "@/components/marketing/StoreCard";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { Reveal } from "@/components/motion/Reveal";
import { listCategories } from "@/lib/db/repositories/categories";
import {
  countActiveCoupons,
  listActiveCoupons,
} from "@/lib/db/repositories/coupons";
import { listPublishedPosts } from "@/lib/db/repositories/posts";
import {
  listActiveStores,
  listFeaturedStores,
} from "@/lib/db/repositories/stores";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

function buildTickerItems(
  coupons: Awaited<ReturnType<typeof listActiveCoupons>>["coupons"],
) {
  const twoWeeksAgo = Date.now() - 14 * 86_400_000;
  return coupons.map((c) => ({
    storeName: c.store.name,
    discountLabel: c.discountLabel,
    isNew: c.createdAt.getTime() > twoWeeksAgo,
  }));
}

export default async function HomePage() {
  const [
    { coupons: featuredCoupons },
    { coupons: newestCoupons },
    couponCount,
    { total: storeCount },
    featuredStores,
    categories,
    { posts: latestPosts },
  ] = await Promise.all([
    listActiveCoupons({ sort: "featured", limit: 8 }),
    listActiveCoupons({ sort: "newest", limit: 12 }),
    countActiveCoupons(),
    listActiveStores({ limit: 1 }),
    listFeaturedStores(6),
    listCategories(),
    listPublishedPosts({ limit: 3 }),
  ]);

  const floatingTickets = featuredCoupons
    .filter((c) => c.isVerified)
    .slice(0, 4)
    .map((c) => ({
      storeName: c.store.name,
      discountLabel: c.discountLabel,
      isVerified: c.isVerified,
    }));

  const tickerItems = buildTickerItems(newestCoupons);

  return (
    <>
      <Hero
        couponCount={couponCount}
        storeCount={storeCount}
        tickets={floatingTickets}
        tickerItems={tickerItems}
      />

      <TrustStrip brandNames={featuredStores.map((s) => s.name)} />

      {/* ------------------------------------------------ Featured deals */}
      <Section>
        <Container size="wide">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-h2 font-bold text-pine">Featured deals</h2>
                <p className="mt-2 text-ink-muted">
                  Hand-checked codes our editors would actually use.
                </p>
              </div>
              <Button href="/coupons" variant="secondary" size="sm">
                View all coupons
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </Reveal>
          <CouponGrid
            coupons={featuredCoupons.map(toTicketCoupon)}
            className="mt-8"
          />
        </Container>
      </Section>

      {/* --------------------------------------------- Browse by category */}
      <Section tone="mint" padding="default">
        <Container size="wide">
          <Reveal>
            <h2 className="text-h2 font-bold text-pine">Browse by category</h2>
            <p className="mt-2 text-ink-muted">
              Deals organized by what you&apos;re actually shopping for.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, i) => (
              <Reveal key={category.id} delay={Math.min(i % 4, 3) * 0.06}>
                <Card interactive className="relative h-full p-5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-mint text-pine">
                    <CategoryIcon name={category.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3.5 font-display font-semibold text-ink">
                    <Link
                      href={`/categories/${category.slug}`}
                      className="after:absolute after:inset-0"
                    >
                      {category.name}
                    </Link>
                  </h3>
                  <p className="mt-1 text-xs font-medium text-ink-subtle">
                    {category.storeCount}{" "}
                    {category.storeCount === 1 ? "store" : "stores"}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------ Trending stores */}
      <Section>
        <Container size="wide">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-h2 font-bold text-pine">Trending stores</h2>
                <p className="mt-2 text-ink-muted">
                  The brands readers are grabbing codes for right now.
                </p>
              </div>
              <Button href="/stores" variant="secondary" size="sm">
                All stores
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredStores.map((store, i) => (
              <Reveal key={store.id} delay={Math.min(i % 3, 2) * 0.07}>
                <StoreCard store={store} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------- From the blog */}
      {latestPosts.length > 0 && (
        <Section tone="mint">
          <Container size="wide">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-h2 font-bold text-pine">From the blog</h2>
                  <p className="mt-2 text-ink-muted">
                    Reviews, comparisons, and guides — written before the
                    discount, not for it.
                  </p>
                </div>
                <Button href="/blog" variant="secondary" size="sm">
                  All articles
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </Reveal>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {latestPosts.map((post, i) => (
                <Reveal key={post.id} delay={i * 0.08}>
                  <Card interactive className="relative flex h-full flex-col p-6">
                    <p className="text-xs font-medium text-ink-subtle">
                      {post.publishedAt ? formatDate(post.publishedAt) : ""}
                      {post.category ? ` · ${post.category.name}` : ""}
                      {` · ${post.readingMinutes} min read`}
                    </p>
                    <h3 className="mt-3 font-display text-xl leading-snug font-semibold text-ink">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="after:absolute after:inset-0"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">
                      {post.excerpt}
                    </p>
                    <p className="mt-auto pt-4 text-sm font-semibold text-pine">
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
            <h2 className="max-w-xl text-h2 font-bold text-white">
              The five best deals, every Friday
            </h2>
            <p className="mx-auto mt-3 max-w-md text-mint/85">
              One short email a week with the verified codes worth using. No
              noise, unsubscribe anytime.
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
