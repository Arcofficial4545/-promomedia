"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminTableProps<T> = {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  searchPlaceholder?: string;
  /** Render bulk-action buttons for the selected row ids. */
  bulkActions?: (selectedIds: string[], clear: () => void) => React.ReactNode;
  getRowId?: (row: T) => string;
  pageSize?: number;
};

export function AdminTable<T>({
  columns,
  data,
  searchPlaceholder = "Search",
  bulkActions,
  getRowId,
  pageSize = 15,
}: AdminTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    getRowId,
    enableRowSelection: !!bulkActions,
  });

  const selectedIds = Object.keys(rowSelection).filter((k) => rowSelection[k]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <input
            type="search"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 w-full rounded-[var(--radius-input)] border border-line-strong bg-white pr-3 pl-9 text-sm focus:border-emerald focus:shadow-[0_0_0_3px_rgba(30,198,119,0.25)] focus:outline-none"
          />
        </div>
        {bulkActions && selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-muted">
              {selectedIds.length} selected
            </span>
            {bulkActions(selectedIds, () => setRowSelection({}))}
          </div>
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-line bg-mint/60">
                {bulkActions && (
                  <th className="w-10 px-3 py-2.5">
                    <input
                      type="checkbox"
                      aria-label="Select all rows"
                      checked={table.getIsAllRowsSelected()}
                      onChange={table.getToggleAllRowsSelectedHandler()}
                      className="h-4 w-4 accent-[#1ec677]"
                    />
                  </th>
                )}
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2.5 text-left font-semibold whitespace-nowrap text-pine"
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-emerald-600"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions ? 1 : 0)}
                  className="px-3 py-10 text-center text-ink-subtle"
                >
                  Nothing here yet.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-line last:border-0",
                    row.getIsSelected() ? "bg-mint/50" : "hover:bg-mint/30",
                  )}
                >
                  {bulkActions && (
                    <td className="w-10 px-3 py-2.5">
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={row.getIsSelected()}
                        onChange={row.getToggleSelectedHandler()}
                        className="h-4 w-4 accent-[#1ec677]"
                      />
                    </td>
                  )}
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2.5 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-muted">
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-btn)] border border-line hover:border-emerald-600 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-btn)] border border-line hover:border-emerald-600 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
