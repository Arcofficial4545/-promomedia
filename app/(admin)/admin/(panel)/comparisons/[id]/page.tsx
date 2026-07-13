import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ComparisonForm } from "@/components/admin/forms/ComparisonForm";
import { removeComparison } from "@/lib/actions/admin/comparisons";
import {
  adminGetComparison,
} from "@/lib/db/repositories/comparisons";
import { adminListStores } from "@/lib/db/repositories/stores";

export default async function EditComparisonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [comparison, stores] = await Promise.all([
    adminGetComparison(id),
    adminListStores(),
  ]);
  if (!comparison) notFound();

  const removeThis = removeComparison.bind(null, comparison.id);

  return (
    <>
      <AdminPageHeader title={`Edit: ${comparison.title}`}>
        <DeleteButton
          action={removeThis}
          label={comparison.title}
          redirectTo="/admin/comparisons"
        />
      </AdminPageHeader>
      <ComparisonForm
        comparison={comparison}
        stores={stores.map((s) => ({ id: s.id, name: s.name }))}
      />
    </>
  );
}
