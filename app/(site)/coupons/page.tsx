import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CouponGrid } from "@/components/coupon/CouponGrid";
import { toTicketCoupon } from "@/components/coupon/toTicketCoupon";
import { FilterBar } from "@/components/marketing/FilterBar";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Pagination } from "@/components/marketing/Pagination";
import { JsonLd } from "@/components/seo/JsonLd";
import { listCategories } from "@/lib/db/repositories/categories";
import {
  listActiveCoupons,
  type CouponSort,
} from "@/lib/db/repositories/coupons";
import { breadcrumbLd, ogImageUrl } from "@/lib/seo/jsonld";

const PAGE_SIZE = 20;

export const metadata: Metadata = {
  title: "All Coupons and Promo Codes — Verified Daily",
  description:
    "Every active coupon code and deal on Promopedia, checked by our editors. Filter by category, sort by newest or expiring soon.",
  alternates: { canonical: "/coupons" },
  openGraph: {
    title: "All Coupons | Promopedia",
    images: [ogImageUrl("All coupons", "Every active code, verified daily")],
  },
};

type SearchParams = {
  q?: string;
  category?: string;
  type?: string;
  sort?: string;
  page?: string;
};

const SORTS: CouponSort[] = ["featured", "newest", "expiring", "popular"];

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const sort = SORTS.includes(params.sort as CouponSort)
    ? (params.sort as CouponSort)
    : "featured";
  const type =
    params.type === "code" || params.type === "deal" ? params.type : undefined;

  const [{ coupons, total }, categories] = await Promise.all([
    listActiveCoupons({
      search: params.q,
      categorySlug: params.category,
      type,
      sort,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    listCategories(),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", href: "/" },
          { name: "Coupons", href: "/coupons" },
        ])}
      />
      <PageHeader
        title="Today's coupons"
        description={`${total} active ${total === 1 ? "deal" : "deals"} across every store we cover. Codes are checked before they're listed.`}
      />
      <Section padding="tight">
        <Container size="wide">
          <Suspense>
            <FilterBar
              searchPlaceholder="Search coupons and stores"
              selects={[
                {
                  param: "category",
                  label: "Category",
                  emptyValue: "all",
                  options: [
                    { value: "all", label: "All categories" },
                    ...categories.map((c) => ({ value: c.slug, label: c.name })),
                  ],
                },
                {
                  param: "type",
                  label: "Type",
                  emptyValue: "all",
                  options: [
                    { value: "all", label: "Codes and deals" },
                    { value: "code", label: "Codes only" },
                    { value: "deal", label: "Deals only" },
                  ],
                },
                {
                  param: "sort",
                  label: "Sort",
                  emptyValue: "featured",
                  options: [
                    { value: "featured", label: "Featured" },
                    { value: "newest", label: "Newest" },
                    { value: "expiring", label: "Expiring soon" },
                    { value: "popular", label: "Most used" },
                  ],
                },
              ]}
            />
          </Suspense>

          {coupons.length === 0 ? (
            <p className="mt-12 text-center text-ink-muted">
              No coupons match those filters. Try widening the search.
            </p>
          ) : (
            <CouponGrid
              coupons={coupons.map(toTicketCoupon)}
              className="mt-8"
            />
          )}

          <Pagination
            total={total}
            pageSize={PAGE_SIZE}
            currentPage={page}
            basePath="/coupons"
            searchParams={params}
          />
        </Container>
      </Section>
    </>
  );
}
