import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ComparisonForm } from "@/components/admin/forms/ComparisonForm";
import { adminListStores } from "@/lib/db/repositories/stores";

export default async function NewComparisonPage() {
  const stores = await adminListStores();

  return (
    <>
      <AdminPageHeader title="New comparison" />
      <ComparisonForm
        comparison={null}
        stores={stores.map((s) => ({ id: s.id, name: s.name }))}
      />
    </>
  );
}
