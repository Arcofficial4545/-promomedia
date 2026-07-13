import Link from "next/link";
import { BadgeCheck, Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/Badge";
import { adminListComparisons } from "@/lib/db/repositories/comparisons";
import { formatDate } from "@/lib/utils";

export default async function AdminComparisonsPage() {
  const comparisons = await adminListComparisons();

  return (
    <>
      <AdminPageHeader
        title="Comparisons"
        description={`${comparisons.length} matchups`}
        createHref="/admin/comparisons/new"
        createLabel="New comparison"
      />

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-subtle">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Tools</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {comparisons.map((c) => (
              <tr key={c.id} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 font-medium text-ink">
                    {c.title}
                    {c.isFeatured && (
                      <BadgeCheck
                        className="h-4 w-4 text-emerald-600"
                        aria-label="Featured"
                      />
                    )}
                  </span>
                  <span className="font-mono text-xs text-ink-subtle">
                    /compare/{c.slug}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {c.storeA.name} vs {c.storeB.name}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={c.status === "published" ? "verified" : "default"}>
                    {c.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-ink-subtle">
                  {formatDate(c.updatedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/comparisons/${c.id}`}
                    className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-btn)] border border-line px-2.5 text-xs font-medium text-ink transition-colors hover:border-emerald-600"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {comparisons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-muted">
                  No comparisons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
