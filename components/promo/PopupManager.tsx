"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useMediaQuery } from "@/components/motion/useMediaQuery";
import { useReducedMotion } from "@/components/motion/useReducedMotion";
import type { SettingsPopupRules } from "@/lib/db/schema";
import { promoMatchesPath } from "@/lib/promos/match";
import type { PromoData } from "@/lib/promos/resolve";
import { PromoCard } from "./PromoCard";

type PopupManagerProps = {
  timedPromo: PromoData | null;
  exitPromo: PromoData | null;
  rules: SettingsPopupRules;
};

/* ------------------------- first-party cookie helpers ------------------ */

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function setCookie(name: string, value: string, maxAgeSeconds?: number) {
  const maxAge = maxAgeSeconds ? `; max-age=${maxAgeSeconds}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax${maxAge}`;
}

function seenCount(promoId: string): number {
  return Number(getCookie(`pp_promo_${promoId}`)) || 0;
}

function markSeen(promoId: string, frequencyDays: number) {
  setCookie(
    `pp_promo_${promoId}`,
    String(seenCount(promoId) + 1),
    frequencyDays * 86_400,
  );
  setCookie("pp_popup_last", String(Date.now()), 30 * 86_400);
}

function underGlobalCooldown(cooldownHours: number): boolean {
  const last = Number(getCookie("pp_popup_last")) || 0;
  return Date.now() - last < cooldownHours * 3_600_000;
}

function popupAllowed(promo: PromoData, rules: SettingsPopupRules, path: string): boolean {
  if (!rules.popupsEnabled) return false;
  if (!promoMatchesPath(promo.targetingRules, path)) return false;
  if (underGlobalCooldown(rules.globalCooldownHours)) return false;
  const cap = promo.targetingRules.frequencyCap ?? 1;
  return seenCount(promo.id) < cap;
}

/* ------------------------------- component ----------------------------- */

export function PopupManager({ timedPromo, exitPromo, rules }: PopupManagerProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const isTouch = useMediaQuery("(pointer: coarse)", true);
  const [openPromo, setOpenPromo] = useState<PromoData | null>(null);
  const exitShownRef = useRef(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const openPopup = useCallback(
    (promo: PromoData) => {
      // Never stack popups.
      setOpenPromo((current) => {
        if (current) return current;
        markSeen(promo.id, promo.targetingRules.frequencyDays ?? 7);
        return promo;
      });
    },
    [],
  );

  const close = useCallback(() => {
    setOpenPromo(null);
  }, []);

  // Timed popup.
  useEffect(() => {
    if (!timedPromo) return;
    if (!popupAllowed(timedPromo, rules, pathname)) return;
    const delay = timedPromo.targetingRules.delayMs ?? rules.defaultDelayMs;
    const timer = setTimeout(() => openPopup(timedPromo), delay);
    return () => clearTimeout(timer);
  }, [timedPromo, rules, pathname, openPopup]);

  // Exit-intent popup (desktop pointer only, once per session).
  useEffect(() => {
    if (!exitPromo || isTouch) return;
    if (getCookie("pp_exit_shown") === "1") return;

    const onMouseOut = (e: MouseEvent) => {
      if (exitShownRef.current) return;
      if (e.relatedTarget !== null || e.clientY > 8) return;
      if (!popupAllowed(exitPromo, rules, window.location.pathname)) return;
      exitShownRef.current = true;
      setCookie("pp_exit_shown", "1"); // session cookie
      openPopup(exitPromo);
    };

    document.addEventListener("mouseout", onMouseOut);
    return () => document.removeEventListener("mouseout", onMouseOut);
  }, [exitPromo, isTouch, rules, openPopup]);

  // Focus management: trap Tab inside, Esc closes, restore focus on close.
  useEffect(() => {
    if (!openPromo) {
      previousFocusRef.current?.focus?.();
      previousFocusRef.current = null;
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement;
    const dialog = dialogRef.current;
    dialog
      ?.querySelector<HTMLElement>(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
      )
      ?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const focusables = [
        ...dialog.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        ),
      ].filter((el) => !el.hasAttribute("disabled"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [openPromo, close]);

  return (
    <AnimatePresence>
      {openPromo && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2 }}
        >
          <button
            type="button"
            aria-label="Close popup"
            onClick={close}
            className="absolute inset-0 bg-pine-900/60"
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Special offer"
            className="relative w-full max-w-md"
            initial={
              reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }
            }
            animate={
              reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }
            }
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="overflow-hidden rounded-[var(--radius-card)] bg-white shadow-lg">
              <div className="flex items-center justify-end p-2 pb-0">
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-btn)] text-ink-muted transition-colors hover:bg-mint hover:text-pine"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="p-4 pt-0">
                <PromoCard promo={openPromo} variant="card" className="border-0 bg-white p-2" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
