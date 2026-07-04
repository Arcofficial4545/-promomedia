import "server-only";
import type { TicketCoupon } from "@/components/coupon/CouponTicket";
import { toTicketCoupon } from "@/components/coupon/toTicketCoupon";
import { getCouponById } from "@/lib/db/repositories/coupons";
import {
  getActivePromoForPlacement,
  getTopActivePromo,
} from "@/lib/db/repositories/promos";
import type { Promo } from "@/lib/db/schema";
import type {
  PromoPayload,
  PromoPlacement,
  PromoTargetingRules,
  PromoType,
} from "@/lib/db/schema";

/** Serializable promo bundle passed to client/server render. */
export type PromoData = {
  id: string;
  placement: PromoPlacement;
  type: PromoType;
  payload: PromoPayload;
  targetingRules: PromoTargetingRules;
  coupon: TicketCoupon | null;
};

async function toPromoData(promo: Promo): Promise<PromoData | null> {
  let coupon: TicketCoupon | null = null;
  if (promo.type === "coupon-highlight" && promo.payload.couponId) {
    const full = await getCouponById(promo.payload.couponId);
    if (full && full.isActive) {
      const expired =
        full.expiresAt !== null && full.expiresAt.getTime() <= Date.now();
      if (!expired) coupon = toTicketCoupon(full);
    }
    // A coupon-highlight promo without a live coupon renders nothing.
    if (!coupon) return null;
  }

  return {
    id: promo.id,
    placement: promo.placement,
    type: promo.type,
    payload: promo.payload,
    targetingRules: promo.targetingRules,
    coupon,
  };
}

export async function resolvePromo(
  placement: PromoPlacement,
  path: string,
): Promise<PromoData | null> {
  const promo = await getActivePromoForPlacement(placement, path);
  if (!promo) return null;
  return toPromoData(promo);
}

/** Popup variant: path targeting is evaluated client-side on navigation. */
export async function resolvePopupPromo(
  placement: "popup-timed" | "popup-exit",
): Promise<PromoData | null> {
  const promo = await getTopActivePromo(placement);
  if (!promo) return null;
  return toPromoData(promo);
}
