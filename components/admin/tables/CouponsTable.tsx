"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { setCouponsActive } from "@/lib/actions/admin/coupons";
import { AdminTable } from "@/components/admin/AdminTable";
import { Badge } from "@/components/ui/Badge";

export type CouponRow = {
  id: string;
  title: string;
  storeName: string;
  type: string;
  code: string | null;
  discountLabel: string;
  clickCount: number;
  isVerified: boolean;
  isActive: boolean;
  expiresAt: string | null; // ISO or null
  expired: boolean;
};

const columns: ColumnDef<CouponRow, unknown>[] = [
  {
    accessorKey: "title",
    header: "Coupon",
    cell: ({ row }) => (
      <div className="max-w-72">
        <p className="truncate font-medium text-ink">{row.original.title}</p>
        <p className="font-mono text-xs text-ink-subtle">
          {row.original.code ?? "deal"} · {row.original.discountLabel}
        </p>
      </div>
    ),
  },
  { accessorKey: "storeName", header: "Store" },
  {
    accessorKey: "clickCount",
    header: "Clicks",
    cell: ({ getValue }) => <span className="font-mono">{Number(getValue())}</span>,
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    cell: ({ row }) =>
      row.original.expiresAt ? (
        <span className={row.original.expired ? "text-danger" : "text-ink-muted"}>
          {new Date(row.original.expiresAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
          {row.original.expired ? " (expired)" : ""}
        </span>
      ) : (
        <span className="text-ink-subtle">Never</span>
      ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span className="flex items-center gap-1.5">
        <Badge variant={row.original.isActive ? "verified" : "danger"}>
          {row.original.isActive ? "Active" : "Off"}
        </Badge>
        {row.original.isVerified && <Badge variant="emerald">Verified</Badge>}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={`/admin/coupons/${row.original.id}`}
        className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-btn)] border border-line px-2.5 text-xs font-medium text-ink transition-colors hover:border-emerald-600"
      >
        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        Edit
      </Link>
    ),
  },
];

export function CouponsTable({ coupons }: { coupons: CouponRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function bulk(ids: string[], isActive: boolean, clear: () => void) {
    startTransition(async () => {
      const result = await setCouponsActive(ids, isActive);
      toast(result.message);
      clear();
      router.refresh();
    });
  }

  return (
    <AdminTable
      columns={columns}
      data={coupons}
      searchPlaceholder="Search coupons"
      getRowId={(row) => row.id}
      bulkActions={(ids, clear) => (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => bulk(ids, true, clear)}
            className="inline-flex h-9 items-center rounded-[var(--radius-btn)] border border-line px-3 text-sm font-medium text-success hover:border-success disabled:opacity-60"
          >
            Activate
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => bulk(ids, false, clear)}
            className="inline-flex h-9 items-center rounded-[var(--radius-btn)] border border-line px-3 text-sm font-medium text-danger hover:border-danger disabled:opacity-60"
          >
            Deactivate
          </button>
        </>
      )}
    />
  );
}
