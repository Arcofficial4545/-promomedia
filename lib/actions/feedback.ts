"use server";

import { headers } from "next/headers";
import { hashUserAgent } from "@/lib/analytics/hash";
import { recordCodeVote } from "@/lib/db/repositories/feedback";
import { clientKeyFromHeaders, rateLimit } from "@/lib/rateLimit";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type VoteResult =
  | { ok: true; counted: boolean }
  | { ok: false; message: string };

/**
 * "Did this code work?" vote. One per coupon per visitor (dedupe by hashed
 * IP+UA), rate-limited. Counts are denormalized onto the coupon.
 */
export async function voteCodeWorked(
  couponId: string,
  worked: boolean,
): Promise<VoteResult> {
  if (!UUID_RE.test(couponId)) {
    return { ok: false, message: "Invalid coupon." };
  }

  const h = await headers();
  const clientKey = clientKeyFromHeaders(h);
  if (!rateLimit(`vote:${clientKey}`, { limit: 20, windowMs: 3_600_000 }).ok) {
    return { ok: false, message: "Too many votes. Try again later." };
  }

  // Stable per-visitor key without storing raw PII.
  const visitorHash =
    hashUserAgent(`${clientKey}|${h.get("user-agent") ?? ""}`) ?? clientKey;

  try {
    const { counted } = await recordCodeVote({ couponId, worked, visitorHash });
    return { ok: true, counted };
  } catch {
    return { ok: false, message: "Could not record your vote." };
  }
}
