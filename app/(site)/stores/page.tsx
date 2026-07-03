import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { FilterBar } from "@/components/marketing/FilterBar";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Pagination } from "@/components/marketing/Pagination";
import { StoreCard } from "@/components/marketing/StoreCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { listCategories } from "@/lib/db/repositories/categories";
import {
  listActiveStores,
  type StoreSort,
} from "@/lib/db/repositories/stores";
import { breadcrumbLd, itemListLd, ogImageUrl } from "@/lib/seo/jsonld";

const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "All Stores — Browse Brands with Verified Deals",
  description:
    "Every store on Promopedia: AI tools, SaaS products, and digital services with verified coupon codes and editorial coverage.",
  alternates: { canonical: "/stores" },
  openGraph: {
    title: "All Stores | Promopedia",
    images: [ogImageUrl("All stores", "Verified deals for the tools you already want")],
  },
};

type SearchParams = {
  q?: string;
  category?: string;
  sort?: string;
  page?: string;
};

const SORTS: StoreSort[] = ["popular", "newest", "rating", "name"];

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const sort = SORTS.includes(params.sort as StoreSort)
    ? (params.sort as StoreSort)
    : "popular";

  const [{ stores, total }, categories] = await Promise.all([
    listActiveStores({
      search: params.q,
      categorySlug: params.category,
      sort,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    listCategories(),
  ]);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Home", href: "/" },
            { name: "Stores", href: "/stores" },
          ]),
          itemListLd(
            stores.map((s) => ({ name: s.name, href: `/stores/${s.slug}` })),
          ),
        ]}
      />
      <PageHeader
        title="All stores"
        description="Every brand we cover, with active deal counts and the best current discount. Updated daily."
      />
      <Section padding="tight">
        <Container size="wide">
          <Suspense>
            <FilterBar
              searchPlaceholder="Search stores"
              selects={[
                {
                  param: "category",
                  label: "Category",
                  emptyValue: "all",
                  options: [
                    { value: "all", label: "All categories" },
                    ...categories.map((c) => ({
                      value: c.slug,
                      label: c.name,
                    })),
                  ],
                },
                {
                  param: "sort",
                  label: "Sort",
                  emptyValue: "popular",
                  options: [
                    { value: "popular", label: "Most popular" },
                    { value: "newest", label: "Newest" },
                    { value: "rating", label: "Highest rated" },
                    { value: "name", label: "A to Z" },
                  ],
                },
              ]}
            />
          </Suspense>

          {stores.length === 0 ? (
            <p className="mt-12 text-center text-ink-muted">
              No stores match those filters yet. Try clearing the search.
            </p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}

          <Pagination
            total={total}
            pageSize={PAGE_SIZE}
            currentPage={page}
            basePath="/stores"
            searchParams={params}
          />
        </Container>
      </Section>
    </>
  );
}
