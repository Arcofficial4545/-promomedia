import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink, Star } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CouponGrid } from "@/components/coupon/CouponGrid";
import { CouponTicket } from "@/components/coupon/CouponTicket";
import { StoreLogo } from "@/components/coupon/StoreLogo";
import { toTicketCoupon } from "@/components/coupon/toTicketCoupon";
import { JsonLd } from "@/components/seo/JsonLd";
import { listCouponsForStore } from "@/lib/db/repositories/coupons";
import { listPostsForStore } from "@/lib/db/repositories/posts";
import {
  getStoreBySlug,
  listAllStoreSlugs,
} from "@/lib/db/repositories/stores";
import { breadcrumbLd, ogImageUrl, storeLd } from "@/lib/seo/jsonld";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listAllStoreSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) return { title: "Store not found" };
  const title =
    store.seoTitle ?? `${store.name} Coupons and Promo Codes`;
  const description =
    store.seoDescription ??
    `The latest verified ${store.name} deals and discount codes. ${store.tagline}`;
  return {
    title,
    description,
    alternates: { canonical: `/stores/${store.slug}` },
    openGraph: {
      title,
      description,
      images: [store.ogImageUrl ?? ogImageUrl(`${store.name} deals`, store.tagline)],
    },
  };
}

export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const [{ active, expired }, relatedPosts] = await Promise.all([
    listCouponsForStore(store.id),
    listPostsForStore(store.id),
  ]);

  // `active` from the repository already excludes expired coupons.
  const bestDeal = active[0] ?? null;
  const liveActive = active;

  return (
    <>
      <JsonLd
        data={[
          storeLd(store, liveActive),
          breadcrumbLd([
            { name: "Home", href: "/" },
            { name: "Stores", href: "/stores" },
            { name: store.name, href: `/stores/${store.slug}` },
          ]),
        ]}
      />

      {/* ------------------------------------------------ Hero band */}
      <Section tone="pine" padding="tight">
        <Container size="wide">
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-mint/70">
            <Link href="/stores" className="hover:text-white">
              Stores
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-white">{store.name}</span>
          </nav>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <StoreLogo name={store.name} logoUrl={store.logoUrl} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-h1 font-bold text-white">{store.name}</h1>
                {store.rating > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white">
                    <Star
                      className="h-4 w-4 fill-emerald text-emerald"
                      aria-hidden="true"
                    />
                    {store.rating.toFixed(1)} / 5
                  </span>
                )}
              </div>
              <p className="mt-2 max-w-2xl text-body-lg text-mint/85">
                {store.tagline}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {store.categories.map((cat) => (
                  <Link key={cat.id} href={`/categories/${cat.slug}`}>
                    <Badge
                      variant="default"
                      className="transition-colors hover:bg-emerald hover:text-pine-900"
                    >
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
            <a
              href={bestDeal ? `/go/${bestDeal.id}` : store.websiteUrl}
              target="_blank"
              rel="sponsored noopener"
              className="btn-gloss btn-primary press-down inline-flex h-11 shrink-0 items-center gap-2 rounded-[var(--radius-btn)] px-5 text-sm font-semibold"
            >
              Visit site
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </Container>
      </Section>

      <Section padding="tight">
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
            {/* -------------------------------------- Coupons column */}
            <div className="min-w-0">
              <h2 className="text-h3 font-bold text-pine">
                {liveActive.length > 0
                  ? `${liveActive.length} active ${liveActive.length === 1 ? "deal" : "deals"} for ${store.name}`
                  : `No active deals for ${store.name} right now`}
              </h2>
              <div className="mt-6">
                <CouponGrid
                  coupons={liveActive.map(toTicketCoupon)}
                  columns={1}
                  hideStore
                  animated={false}
                />
              </div>

              {expired.length > 0 && (
                <details className="mt-10">
                  <summary className="cursor-pointer text-sm font-semibold text-ink-muted hover:text-pine">
                    Recently expired ({expired.length})
                  </summary>
                  <div className="mt-4 grid gap-4">
                    {expired.map((coupon) => (
                      <CouponTicket
                        key={coupon.id}
                        coupon={toTicketCoupon(coupon)}
                        hideStore
                      />
                    ))}
                  </div>
                </details>
              )}

              <div className="prose-pine mt-12 max-w-none border-t border-line pt-8">
                <h2 className="text-h4 font-bold text-pine">
                  About {store.name}
                </h2>
                <p className="mt-3 leading-relaxed text-ink-muted">
                  {store.description}
                </p>
              </div>
            </div>

            {/* -------------------------------------- Sidebar */}
            <aside className="space-y-6 lg:pt-1">
              {bestDeal && (
                <Card tone="mint" className="p-5">
                  <p className="text-xs font-semibold tracking-wide text-ink-muted uppercase">
                    Best deal right now
                  </p>
                  <p className="mt-2 font-mono text-2xl font-bold text-pine">
                    {bestDeal.discountLabel}
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">{bestDeal.title}</p>
                  <a
                    href={`/go/${bestDeal.id}`}
                    target="_blank"
                    rel="sponsored noopener"
                    className="btn-gloss btn-pine press-down mt-4 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-[var(--radius-btn)] text-sm font-semibold"
                  >
                    Get it
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </Card>
              )}
              {/* TODO(phase-7): <PromoSlot placement="sidebar" /> */}
            </aside>
          </div>

          {/* ------------------------------------------ Related posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 border-t border-line pt-10">
              <h2 className="text-h3 font-bold text-pine">
                Coverage of {store.name}
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((post) => (
                  <Card key={post.id} interactive className="relative p-5">
                    <p className="text-xs text-ink-subtle">
                      {post.publishedAt ? formatDate(post.publishedAt) : ""}
                      {post.category ? ` · ${post.category.name}` : ""}
                    </p>
                    <h3 className="mt-2 font-display text-lg leading-snug font-semibold text-ink">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="after:absolute after:inset-0"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
                      {post.excerpt}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
