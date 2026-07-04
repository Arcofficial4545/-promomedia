import Link from "next/link";
import { Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/Badge";
import { adminListPromos } from "@/lib/db/repositories/promos";

function withStatus(promos: Awaited<ReturnType<typeof adminListPromos>>) {
  const now = Date.now();
  return promos.map((promo) => ({
    ...promo,
    scheduledOut:
      (promo.startsAt !== null && promo.startsAt.getTime() > now) ||
      (promo.endsAt !== null && promo.endsAt.getTime() <= now),
  }));
}

export default async function AdminPromosPage() {
  const promos = withStatus(await adminListPromos());

  return (
    <>
      <AdminPageHeader
        title="Promos"
        description={`${promos.length} promotional units`}
        createHref="/admin/promos/new"
        createLabel="New promo"
      />
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-mint/60 text-left text-pine">
              <th className="px-3 py-2.5 font-semibold">Promo</th>
              <th className="px-3 py-2.5 font-semibold">Placement</th>
              <th className="px-3 py-2.5 font-semibold">Type</th>
              <th className="px-3 py-2.5 font-semibold">Priority</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {promos.map((promo) => {
              const { scheduledOut } = promo;
              return (
                <tr key={promo.id} className="border-b border-line last:border-0 hover:bg-mint/30">
                  <td className="max-w-64 truncate px-3 py-2.5 font-medium text-ink">
                    {promo.name}
                  </td>
                  <td className="px-3 py-2.5 font-mono text-xs text-ink-muted">
                    {promo.placement}
                  </td>
                  <td className="px-3 py-2.5 text-ink-muted">{promo.type}</td>
                  <td className="px-3 py-2.5 font-mono">{promo.priority}</td>
                  <td className="px-3 py-2.5">
                    <Badge
                      variant={
                        !promo.isActive
                          ? "danger"
                          : scheduledOut
                            ? "warning"
                            : "verified"
                      }
                    >
                      {!promo.isActive
                        ? "Off"
                        : scheduledOut
                          ? "Scheduled"
                          : "Live"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Link
                      href={`/admin/promos/${promo.id}`}
                      className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-btn)] border border-line px-2.5 text-xs font-medium text-ink transition-colors hover:border-emerald-600"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
