"use server";

import { headers } from "next/headers";
import { incrementViewCount } from "@/lib/db/repositories/posts";
import { clientKeyFromHeaders, rateLimit } from "@/lib/rateLimit";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function registerView(postId: string): Promise<void> {
  if (!UUID_RE.test(postId)) return;
  const h = await headers();
  if (!rateLimit(`view:${clientKeyFromHeaders(h)}:${postId}`, { limit: 2, windowMs: 3_600_000 }).ok) {
    return;
  }
  try {
    await incrementViewCount(postId);
  } catch {
    // analytics must never break the page
  }
}
