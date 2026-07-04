import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
      <StoresTable
        stores={stores.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
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
