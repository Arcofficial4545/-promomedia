import type { Category, Coupon, Store } from "@/lib/db/schema";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SITE_NAME = "Promopedia";

type JsonLdObject = Record<string, unknown>;

export function organizationLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/og?title=${encodeURIComponent(SITE_NAME)}`,
    description:
      "A deals and discovery platform for AI tools, SaaS products, and digital services.",
  };
}

export function websiteLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbLd(
  items: { name: string; href: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  };
}

export function storeLd(store: Store, activeCoupons: Coupon[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: store.name,
    url: `${SITE_URL}/stores/${store.slug}`,
    description: store.tagline,
    ...(store.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: store.rating,
            bestRating: 5,
            ratingCount: Math.max(
              1,
              activeCoupons.reduce((sum, c) => sum + c.successReports, 0),
            ),
          },
        }
      : {}),
    makesOffer: activeCoupons.slice(0, 20).map((coupon) => ({
      "@type": "Offer",
      name: coupon.title,
      url: `${SITE_URL}/stores/${store.slug}`,
      availability: "https://schema.org/InStock",
      ...(coupon.expiresAt
        ? { validThrough: coupon.expiresAt.toISOString() }
        : {}),
    })),
  };
}

export function itemListLd(
  items: { name: string; href: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.href}`,
    })),
  };
}

export function articleLd(post: {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: Date | null;
  updatedAt: Date;
  authorName: string;
  category: Category | null;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}/blog/${post.slug}`,
    ...(post.publishedAt
      ? { datePublished: post.publishedAt.toISOString() }
      : {}),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Person", name: post.authorName },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(post.category ? { articleSection: post.category.name } : {}),
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };
}

export function ogImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set("subtitle", subtitle);
  return `${SITE_URL}/og?${params.toString()}`;
}
