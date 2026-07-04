import { Download } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { listSubscribers } from "@/lib/db/repositories/newsletter";
import { formatDate } from "@/lib/utils";

export default async function AdminNewsletterPage() {
  const subscribers = await listSubscribers();

  return (
    <>
      <AdminPageHeader
        title="Newsletter"
        description={`${subscribers.length} subscribers`}
      >
        <a
          href="/admin/newsletter/export"
          className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-btn)] border border-line-strong bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-emerald-600"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </a>
      </AdminPageHeader>

      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-mint/60 text-left text-pine">
              <th className="px-3 py-2.5 font-semibold">Email</th>
              <th className="px-3 py-2.5 font-semibold">Source</th>
              <th className="px-3 py-2.5 font-semibold">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-10 text-center text-ink-subtle">
                  No subscribers yet.
                </td>
              </tr>
            )}
            {subscribers.map((sub) => (
              <tr key={sub.id} className="border-b border-line last:border-0 hover:bg-mint/30">
                <td className="px-3 py-2.5 font-medium text-ink">{sub.email}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-ink-muted">
                  {sub.source}
                </td>
                <td className="px-3 py-2.5 text-ink-muted">
                  {formatDate(sub.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
