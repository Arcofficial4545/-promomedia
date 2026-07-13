"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  admin: "Dashboard",
  stores: "Stores",
  coupons: "Coupons",
  categories: "Categories",
  blog: "Blog",
  promos: "Promos",
  media: "Media",
  newsletter: "Newsletter",
  messages: "Messages",
  analytics: "Analytics",
  settings: "Settings",
  new: "New",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Path-derived breadcrumb for the admin topbar. */
export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "admin") return null;

  const crumbs = segments.map((segment, i) => ({
    href: "/" + segments.slice(0, i + 1).join("/"),
    label: UUID_RE.test(segment) ? "Edit" : (LABELS[segment] ?? segment),
    isLast: i === segments.length - 1,
  }));

  if (crumbs.length === 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-ink-subtle">
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1">
            {crumb.isLast ? (
              <span aria-current="page" className="font-medium text-pine">
                {crumb.label}
              </span>
            ) : (
              <>
                <Link href={crumb.href} className="hover:text-pine">
                  {crumb.label}
                </Link>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
