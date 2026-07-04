import type { PromoTargetingRules } from "@/lib/db/schema";

/**
 * Path targeting shared by server resolution and the client popup manager.
 * No server-only import — pure logic.
 */
export function promoMatchesPath(
  rules: PromoTargetingRules,
  path: string,
): boolean {
  if (rules.excludePaths?.some((p) => path.startsWith(p))) return false;
  if (!rules.paths || rules.paths.length === 0) return true;
  return rules.paths.some((p) => path === p || path.startsWith(p));
}
