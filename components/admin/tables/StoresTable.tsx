"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck, Pencil } from "lucide-react";
import { AdminTable } from "@/components/admin/AdminTable";
import { RefetchAssetsButton } from "@/components/admin/RefetchAssetsButton";
import { Badge } from "@/components/ui/Badge";

export type StoreRow = {
  id: string;
  name: string;
  slug: string;
  score: number | null;
  rating: number;
  isFeatured: boolean;
  isActive: boolean;
  activeCouponCount: number;
  categoryNames: string;
};

const columns: ColumnDef<StoreRow, unknown>[] = [
  {
    accessorKey: "name",
    header: "Store",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-ink">{row.original.name}</p>
        <p className="font-mono text-xs text-ink-subtle">/{row.original.slug}</p>
      </div>
    ),
  },
  {
    accessorKey: "categoryNames",
    header: "Categories",
    cell: ({ getValue }) => (
      <span className="text-ink-muted">{String(getValue()) || "—"}</span>
    ),
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ getValue }) => {
      const v = getValue() as number | null;
      return v === null ? (
        <span className="text-ink-subtle">—</span>
      ) : (
        <Badge variant="pine" className="font-mono">
          {v.toFixed(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "activeCouponCount",
    header: "Deals",
    cell: ({ getValue }) => (
      <span className="font-mono">{Number(getValue())}</span>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ getValue }) => (
      <span className="font-mono">{Number(getValue()).toFixed(1)}</span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span className="flex items-center gap-1.5">
        <Badge variant={row.original.isActive ? "verified" : "danger"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
        {row.original.isFeatured && (
          <BadgeCheck className="h-4 w-4 text-emerald-600" aria-label="Featured" />
        )}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1.5">
        <RefetchAssetsButton id={row.original.id} />
        <Link
          href={`/admin/stores/${row.original.id}`}
          className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-btn)] border border-line px-2.5 text-xs font-medium text-ink transition-colors hover:border-emerald-600"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </Link>
      </div>
    ),
  },
];

export function StoresTable({ stores }: { stores: StoreRow[] }) {
  return (
    <AdminTable
      columns={columns}
      data={stores}
      searchPlaceholder="Search stores"
      getRowId={(row) => row.id}
    />
  );
}
