import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  total: number;
  pageSize: number;
  currentPage: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
};

function pageHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number,
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && k !== "page") sp.set(k, v);
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  total,
  pageSize,
  currentPage,
  basePath,
  searchParams = {},
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = Math.max(1, end - 4); i <= end; i++) pages.push(i);

  const linkBase =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-[var(--radius-btn)] border px-3 text-sm font-medium transition-colors";

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      {currentPage > 1 && (
        <Link
          href={pageHref(basePath, searchParams, currentPage - 1)}
          aria-label="Previous page"
          className={cn(linkBase, "border-line text-ink-muted hover:border-emerald-600 hover:text-pine")}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={pageHref(basePath, searchParams, page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            linkBase,
            page === currentPage
              ? "border-pine bg-pine text-white"
              : "border-line text-ink-muted hover:border-emerald-600 hover:text-pine",
          )}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={pageHref(basePath, searchParams, currentPage + 1)}
          aria-label="Next page"
          className={cn(linkBase, "border-line text-ink-muted hover:border-emerald-600 hover:text-pine")}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}
