import type { MetadataRoute } from "next";
import { listAllCategorySlugs } from "@/lib/db/repositories/categories";
import { listAllPublishedPostSlugs } from "@/lib/db/repositories/posts";
import { listAllStoreSlugs } from "@/lib/db/repositories/stores";
import { SITE_URL } from "@/lib/seo/jsonld";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [storeSlugs, categorySlugs, postSlugs] = await Promise.all([
    listAllStoreSlugs(),
    listAllCategorySlugs(),
    listAllPublishedPostSlugs(),
  ]);

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/stores`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/coupons`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE_URL}/disclosure`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.2 },
  ];

  return [
    ...staticPages,
    ...storeSlugs.map((slug) => ({
      url: `${SITE_URL}/stores/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...categorySlugs.map((slug) => ({
      url: `${SITE_URL}/categories/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...postSlugs.map((slug) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
