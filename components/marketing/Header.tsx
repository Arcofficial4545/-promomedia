"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Search, Ticket, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

const navLinks = [
  { href: "/stores", label: "Stores" },
  { href: "/categories", label: "Categories" },
  { href: "/coupons", label: "Coupons" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const [condensed, setCondensed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setCondensed(window.scrollY > 24));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white transition-[height,box-shadow,border-color] duration-300",
        condensed ? "border-line shadow-sm" : "border-transparent",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center justify-between px-4 transition-[height] duration-300 sm:px-6 lg:px-8",
          condensed ? "h-14" : "h-[4.5rem]",
        )}
      >
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-pine"
          aria-label="Promopedia home"
        >
          Promopedia
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-[var(--radius-btn)] px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-pine underline decoration-emerald decoration-2 underline-offset-8"
                    : "text-ink-muted hover:bg-mint hover:text-pine",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="press-down inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-btn)] text-ink-muted transition-colors hover:bg-mint hover:text-pine"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link
            href="/coupons"
            className="btn-gloss btn-primary press-down hidden h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold sm:inline-flex"
          >
            <Ticket className="h-4 w-4" aria-hidden="true" />
            Today&apos;s Deals
          </Link>
          <button
            type="button"
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
            aria-expanded={drawerOpen}
            aria-controls="mobile-nav"
            onClick={() => setDrawerOpen((open) => !open)}
            className="press-down inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-btn)] text-pine transition-colors hover:bg-mint md:hidden"
          >
            {drawerOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 top-14 z-40 bg-pine-900/50 md:hidden"
              onClick={() => setDrawerOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            />
            <motion.nav
              id="mobile-nav"
              aria-label="Mobile"
              className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col gap-1 border-l border-line bg-white p-6 pt-20 shadow-lg md:hidden"
              initial={reducedMotion ? { opacity: 0 } : { x: "100%" }}
              animate={reducedMotion ? { opacity: 1 } : { x: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { x: "100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
                className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-btn)] text-pine hover:bg-mint"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-[var(--radius-btn)] px-3 py-3 text-base font-medium text-ink hover:bg-mint hover:text-pine"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/coupons"
                onClick={() => setDrawerOpen(false)}
                className="btn-gloss btn-primary press-down mt-4 inline-flex h-11 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold"
              >
                <Ticket className="h-4 w-4" aria-hidden="true" />
                Today&apos;s Deals
              </Link>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
