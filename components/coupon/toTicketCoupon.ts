import type { CouponWithStore } from "@/lib/db/repositories/coupons";
import type { TicketCoupon } from "./CouponTicket";

/** Strip a repository coupon down to the serializable ticket props. */
export function toTicketCoupon(coupon: CouponWithStore): TicketCoupon {
  return {
    id: coupon.id,
    title: coupon.title,
    code: coupon.code,
    type: coupon.type,
    discountLabel: coupon.discountLabel,
    terms: coupon.terms,
    expiresAt: coupon.expiresAt,
    isVerified: coupon.isVerified,
    isExclusive: coupon.isExclusive,
    clickCount: coupon.clickCount,
    revealCount: coupon.revealCount,
    successReports: coupon.successReports,
    store: {
      id: coupon.store.id,
      name: coupon.store.name,
      slug: coupon.store.slug,
      logoUrl: coupon.store.logoUrl,
    },
  };
}
