import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CouponGrid } from "@/components/coupon/CouponGrid";
import { toTicketCoupon } from "@/components/coupon/toTicketCoupon";
import { CategoryIcon } from "@/components/marketing/CategoryIcon";
import { PageHeader } from "@/components/marketing/PageHeader";
import { StoreCard } from "@/components/marketing/StoreCard";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getCategoryBySlug,
  listAllCategorySlugs,
} from "@/lib/db/repositories/categories";
import { listActiveCoupons } from "@/lib/db/repositories/coupons";
import { listActiveStores } from "@/lib/db/repositories/stores";
import { breadcrumbLd, ogImageUrl } from "@/lib/seo/jsonld";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await listAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  const title = `${category.name} Deals and Coupon Codes`;
  return {
    title,
    description: category.description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      title,
      images: [ogImageUrl(`${category.name} deals`, category.description)],
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [{ stores }, { coupons }] = await Promise.all([
    listActiveStores({ categorySlug: slug, limit: 12 }),
    listActiveCoupons({ categorySlug: slug, limit: 10 }),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", href: "/" },
          { name: "Categories", href: "/categories" },
          { name: category.name, href: `/categories/${category.slug}` },
        ])}
      />
      <PageHeader
        title={category.name}
        description={category.description}
        meta={
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-emerald">
            <CategoryIcon name={category.icon} className="h-6 w-6" />
          </span>
        }
      />

      <Section padding="tight">
        <Container size="wide">
          <h2 className="text-h3 font-bold text-pine">
            Top {category.name} deals
          </h2>
          {coupons.length === 0 ? (
            <p className="mt-4 text-ink-muted">
              No active deals in this category right now — check back soon.
            </p>
          ) : (
            <CouponGrid
              coupons={coupons.map(toTicketCoupon)}
              className="mt-6"
            />
          )}

          <div className="mt-14 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-h3 font-bold text-pine">
              {category.name} stores
            </h2>
            <Link
              href={`/tools?category=${category.slug}`}
              className="inline-flex items-center gap-1 text-sm font-semibold text-pine hover:text-emerald-600"
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          {stores.length === 0 ? (
            <p className="mt-4 text-ink-muted">No stores here yet.</p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
