import type { PromoPlacement } from "@/lib/db/schema";
import { resolvePromo } from "@/lib/promos/resolve";
import { PromoCard } from "./PromoCard";

type PromoSlotProps = {
  placement: Exclude<PromoPlacement, "popup-timed" | "popup-exit">;
  /** Current pathname, supplied by the page (for targeting rules). */
  path: string;
  className?: string;
};

/**
 * Server component: resolves the highest-priority active promo for a
 * placement + path and renders it. Renders nothing when no promo matches.
 */
export async function PromoSlot({ placement, path, className }: PromoSlotProps) {
  const promo = await resolvePromo(placement, path);
  if (!promo) return null;

  const variant =
    placement === "home-banner"
      ? "banner"
      : placement === "sticky-rail"
        ? "rail"
        : "card";

  return <PromoCard promo={promo} variant={variant} className={className} />;
}
