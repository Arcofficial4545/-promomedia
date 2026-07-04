import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/forms/CategoryForm";

export default function NewCategoryPage() {
  return (
    <>
      <AdminPageHeader title="New category" />
      <CategoryForm category={null} />
    </>
  );
}
