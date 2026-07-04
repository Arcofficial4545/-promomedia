import Link from "next/link";
import { Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryIcon } from "@/components/marketing/CategoryIcon";
import { listCategories } from "@/lib/db/repositories/categories";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <>
      <AdminPageHeader
        title="Categories"
        description={`${categories.length} categories`}
        createHref="/admin/categories/new"
        createLabel="New category"
      />
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-mint/60 text-left text-pine">
              <th className="px-3 py-2.5 font-semibold">Category</th>
              <th className="px-3 py-2.5 font-semibold">Slug</th>
              <th className="px-3 py-2.5 font-semibold">Stores</th>
              <th className="px-3 py-2.5 font-semibold">Order</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-line last:border-0 hover:bg-mint/30">
                <td className="px-3 py-2.5">
                  <span className="flex items-center gap-2.5 font-medium text-ink">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-mint text-pine">
                      <CategoryIcon name={category.icon} className="h-4 w-4" />
                    </span>
                    {category.name}
                  </span>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-ink-subtle">
                  /{category.slug}
                </td>
                <td className="px-3 py-2.5 font-mono">{category.storeCount}</td>
                <td className="px-3 py-2.5 font-mono">{category.sortOrder}</td>
                <td className="px-3 py-2.5 text-right">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-btn)] border border-line px-2.5 text-xs font-medium text-ink transition-colors hover:border-emerald-600"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
