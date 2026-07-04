import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { CategoryForm } from "@/components/admin/forms/CategoryForm";
import { removeCategory } from "@/lib/actions/admin/categories";
import { adminGetCategory } from "@/lib/db/repositories/categories";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await adminGetCategory(id);
  if (!category) notFound();

  const removeThisCategory = removeCategory.bind(null, category.id);

  return (
    <>
      <AdminPageHeader title={`Edit: ${category.name}`}>
        <DeleteButton
          action={removeThisCategory}
          label={category.name}
          redirectTo="/admin/categories"
        />
      </AdminPageHeader>
      <CategoryForm category={category} />
    </>
  );
}
