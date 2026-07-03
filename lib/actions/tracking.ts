"use server";

import { headers } from "next/headers";
import { incrementRevealCount } from "@/lib/db/repositories/coupons";
import { clientKeyFromHeaders, rateLimit } from "@/lib/rateLimit";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Fire-and-forget reveal tracking from the CouponTicket client component. */
export async function registerReveal(couponId: string): Promise<void> {
  if (!UUID_RE.test(couponId)) return;
  const h = await headers();
  const key = `reveal:${clientKeyFromHeaders(h)}`;
  if (!rateLimit(key, { limit: 30, windowMs: 60_000 }).ok) return;
  try {
    await incrementRevealCount(couponId);
  } catch {
    // analytics must never break the UX
  }
}
