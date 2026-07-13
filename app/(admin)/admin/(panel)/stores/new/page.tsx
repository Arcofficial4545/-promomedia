import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StoreForm } from "@/components/admin/forms/StoreForm";
import { listCategories } from "@/lib/db/repositories/categories";
import { adminListStores } from "@/lib/db/repositories/stores";

export default async function NewStorePage() {
  const [categories, allStores] = await Promise.all([
    listCategories(),
    adminListStores(),
  ]);

  return (
    <>
      <AdminPageHeader title="New store" />
      <StoreForm
        store={null}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        allStores={allStores.map((s) => ({ slug: s.slug, name: s.name }))}
      />
    </>
  );
}
