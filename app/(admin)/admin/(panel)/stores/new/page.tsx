import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StoreForm } from "@/components/admin/forms/StoreForm";
import { listCategories } from "@/lib/db/repositories/categories";

export default async function NewStorePage() {
  const categories = await listCategories();

  return (
    <>
      <AdminPageHeader title="New store" />
      <StoreForm
        store={null}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
