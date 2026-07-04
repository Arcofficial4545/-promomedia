import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { ArticleRenderer } from "@/components/blog/ArticleRenderer";
import { ProgressBar } from "@/components/blog/ProgressBar";
import { ShareRail } from "@/components/blog/ShareRail";
import { Toc } from "@/components/blog/Toc";
import { ViewPing } from "@/components/blog/ViewPing";
import {
  collectCouponIds,
  collectHeadings,
  type TiptapNode,
} from "@/components/blog/tiptap";
import { CouponGrid } from "@/components/coupon/CouponGrid";
import { PromoSlot } from "@/components/promo/PromoSlot";
import { toTicketCoupon } from "@/components/coupon/toTicketCoupon";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getCouponsByIds,
  listActiveCoupons,
} from "@/lib/db/repositories/coupons";
import {
  getPublishedPostBySlug,
  listAllPublishedPostSlugs,
  listRelatedStoreIds,
} from "@/lib/db/repositories/posts";
import { articleLd, breadcrumbLd, ogImageUrl, SITE_URL } from "@/lib/seo/jsonld";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await listAllPublishedPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
      images: [post.ogImageUrl ?? ogImageUrl(post.title, `By ${post.author.name}`)],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const doc = post.contentJson as TiptapNode;
  const embeddedIds = collectCouponIds(doc);
  const headings = collectHeadings(doc);

  const [embeddedCoupons, relatedStoreIds] = await Promise.all([
    getCouponsByIds(embeddedIds),
    listRelatedStoreIds(post.id),
  ]);

  // Related deals: active coupons from the stores this article covers.
  const relatedDeals =
    relatedStoreIds.length > 0
      ? (await listActiveCoupons({ limit: 40 })).coupons
          .filter((c) => relatedStoreIds.includes(c.storeId))
          .slice(0, 4)
      : [];

  const couponMap = new Map(
    embeddedCoupons.map((c) => [c.id, toTicketCoupon(c)]),
  );
  const articleUrl = `${SITE_URL}/blog/${post.slug}`;

  return (
    <>
      <JsonLd
        data={[
          articleLd({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            authorName: post.author.name,
            category: post.category,
          }),
          breadcrumbLd([
            { name: "Home", href: "/" },
            { name: "Blog", href: "/blog" },
            { name: post.title, href: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <ProgressBar />
      <ViewPing postId={post.id} />

      {/* ------------------------------------------------ Article header */}
      <Section tone="pine" padding="tight">
        <Container size="narrow">
          <nav aria-label="Breadcrumb" className="text-sm text-mint/70">
            <Link href="/blog" className="hover:text-white">
              Blog
            </Link>
            {post.category && (
              <>
                <span className="mx-2" aria-hidden="true">
                  /
                </span>
                <Link
                  href={`/blog/category/${post.category.slug}`}
                  className="hover:text-white"
                >
                  {post.category.name}
                </Link>
              </>
            )}
          </nav>
          <h1 className="mt-5 text-h1 font-bold text-balance text-white">
            {post.title}
          </h1>
          <p className="mt-4 text-body-lg text-mint/85">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-mint/70">
            <span className="font-medium text-white">{post.author.name}</span>
            <span aria-hidden="true">&middot;</span>
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {formatDate(post.publishedAt)}
              </time>
            )}
            <span aria-hidden="true">&middot;</span>
            <span>{post.readingMinutes} min read</span>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------ Body */}
      <Section padding="tight">
        <Container size="wide">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[3.5rem_minmax(0,1fr)_15rem]">
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <ShareRail title={post.title} url={articleUrl} />
              </div>
            </div>

            <article className="mx-auto w-full max-w-2xl min-w-0">
              <ArticleRenderer
                doc={doc}
                coupons={couponMap}
                promoSlot={
                  <PromoSlot
                    placement="in-content"
                    path={`/blog/${post.slug}`}
                  />
                }
              />

              {post.tags.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Mobile share */}
              <div className="mt-8 lg:hidden">
                <ShareRail title={post.title} url={articleUrl} />
              </div>

              {/* Author bio */}
              <div className="mt-10 flex gap-4 rounded-[var(--radius-card)] border border-line bg-mint/50 p-6">
                <span
                  aria-hidden="true"
                  className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-pine font-display text-xl font-bold text-white"
                >
                  {post.author.name.charAt(0)}
                </span>
                <div>
                  <p className="font-display font-semibold text-ink">
                    {post.author.name}
                  </p>
                  <p className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
                    {post.author.role}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {post.author.bio}
                  </p>
                </div>
              </div>
            </article>

            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-8">
                <Toc entries={headings} />
                <PromoSlot
                  placement="sticky-rail"
                  path={`/blog/${post.slug}`}
                />
              </div>
            </div>
          </div>

          {/* ------------------------------------------ Related deals */}
          {relatedDeals.length > 0 && (
            <div className="mx-auto mt-16 max-w-6xl border-t border-line pt-10">
              <h2 className="text-h3 font-bold text-pine">
                Deals mentioned in this article
              </h2>
              <CouponGrid
                coupons={relatedDeals.map(toTicketCoupon)}
                className="mt-6"
                animated={false}
              />
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
