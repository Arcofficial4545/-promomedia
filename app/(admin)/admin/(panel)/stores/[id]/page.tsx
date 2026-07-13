import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { StoreForm } from "@/components/admin/forms/StoreForm";
import { removeStore } from "@/lib/actions/admin/stores";
import { listCategories } from "@/lib/db/repositories/categories";
import { adminGetStore, adminListStores } from "@/lib/db/repositories/stores";

export default async function EditStorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [store, categories, allStores] = await Promise.all([
    adminGetStore(id),
    listCategories(),
    adminListStores(),
  ]);
  if (!store) notFound();

  const removeThisStore = removeStore.bind(null, store.id);

  return (
    <>
      <AdminPageHeader title={`Edit: ${store.name}`}>
        <DeleteButton
          action={removeThisStore}
          label={store.name}
          redirectTo="/admin/stores"
        />
      </AdminPageHeader>
      <StoreForm
        store={store}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        allStores={allStores
          .filter((s) => s.id !== store.id)
          .map((s) => ({ slug: s.slug, name: s.name }))}
      />
    </>
  );
}
