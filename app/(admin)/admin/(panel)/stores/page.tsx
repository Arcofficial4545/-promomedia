import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RefetchAllAssetsButton } from "@/components/admin/RefetchAssetsButton";
import { StoresTable } from "@/components/admin/tables/StoresTable";
import { adminListStores } from "@/lib/db/repositories/stores";

export default async function AdminStoresPage() {
  const stores = await adminListStores();

  return (
    <>
      <AdminPageHeader
        title="Stores"
        description={`${stores.length} brands`}
        createHref="/admin/stores/new"
        createLabel="New store"
      />
      <div className="mb-4 flex justify-end">
        <RefetchAllAssetsButton />
      </div>
      <StoresTable
        stores={stores.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          score: s.editorialScore,
          rating: s.rating,
          isFeatured: s.isFeatured,
          isActive: s.isActive,
          activeCouponCount: s.activeCouponCount,
          categoryNames: s.categories.map((c) => c.name).join(", "),
        }))}
      />
    </>
  );
}
