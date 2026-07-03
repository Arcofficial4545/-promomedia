import { createHash } from "node:crypto";

/** One-way hash for user agents — we never store the raw string. */
export function hashUserAgent(userAgent: string | null): string | null {
  if (!userAgent) return null;
  return createHash("sha256").update(userAgent).digest("hex").slice(0, 32);
}
