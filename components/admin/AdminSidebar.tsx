"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  FileText,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Mail,
  Megaphone,
  Settings,
  Store,
  Tags,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/stores", label: "Stores", icon: Store },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/promos", label: "Promos", icon: Megaphone },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/messages", label: "Messages", icon: Inbox },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-col gap-0.5 p-3">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2.5 rounded-[var(--radius-btn)] px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-white/10 text-white"
                : "text-mint/60 hover:bg-white/5 hover:text-white",
            )}
            aria-current={active ? "page" : undefined}
          >
            <link.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
