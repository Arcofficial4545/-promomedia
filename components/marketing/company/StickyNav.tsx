"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = { id: string; label: string };

/**
 * Sticky in-page nav with scroll-spy (Section 7.3). The active section gets an
 * emerald underline; collapses into a select on mobile. Sits below the
 * condensed header (top-14).
 */
export function StickyNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <div className="sticky top-[60px] z-30 border-y border-line bg-white/90 backdrop-blur">
      <nav
        aria-label="On this page"
        className="mx-auto hidden max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 md:flex lg:px-8"
      >
        {items.map((it) => (
          <a
            key={it.id}
            href={`#${it.id}`}
            aria-current={active === it.id ? "true" : undefined}
            className={cn(
              "shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors",
              active === it.id
                ? "border-emerald text-pine"
                : "border-transparent text-ink-muted hover:text-pine",
            )}
          >
            {it.label}
          </a>
        ))}
      </nav>
      <div className="px-4 py-2 md:hidden">
        <label htmlFor="section-jump" className="sr-only">
          Jump to section
        </label>
        <select
          id="section-jump"
          value={active}
          onChange={(e) =>
            document
              .getElementById(e.target.value)
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
          className="w-full rounded-[var(--radius-btn)] border border-line bg-white px-3 py-2 text-sm font-medium text-ink"
        >
          {items.map((it) => (
            <option key={it.id} value={it.id}>
              {it.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
