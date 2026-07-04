import "server-only";
import { and, desc, eq, gt, isNull, lte, or } from "drizzle-orm";
import { db } from "../client";
import {
  promos,
  type NewPromo,
  type Promo,
  type PromoPlacement,
} from "../schema";

function isLiveNow() {
  const now = new Date();
  return and(
    eq(promos.isActive, true),
    or(isNull(promos.startsAt), lte(promos.startsAt, now)),
    or(isNull(promos.endsAt), gt(promos.endsAt, now)),
  );
}

function matchesPath(promo: Promo, path: string): boolean {
  const rules = promo.targetingRules;
  if (rules.excludePaths?.some((p) => path.startsWith(p))) return false;
  if (!rules.paths || rules.paths.length === 0) return true;
  return rules.paths.some((p) => path === p || path.startsWith(p));
}

/**
 * Highest-priority live promo for a placement matching the current path.
 * Path targeting rules are JSON, so filtering happens in JS over the small
 * set of live promos for the placement.
 */
export async function getActivePromoForPlacement(
  placement: PromoPlacement,
  path: string,
): Promise<Promo | null> {
  const rows = await db
    .select()
    .from(promos)
    .where(and(eq(promos.placement, placement), isLiveNow()))
    .orderBy(desc(promos.priority), desc(promos.updatedAt));

  return rows.find((p) => matchesPath(p, path)) ?? null;
}

/**
 * Highest-priority live promo for a placement, ignoring path rules — used
 * for popups, where the client evaluates path targeting on navigation.
 */
export async function getTopActivePromo(
  placement: PromoPlacement,
): Promise<Promo | null> {
  const rows = await db
    .select()
    .from(promos)
    .where(and(eq(promos.placement, placement), isLiveNow()))
    .orderBy(desc(promos.priority), desc(promos.updatedAt))
    .limit(1);
  return rows[0] ?? null;
}

/* ------------------------------- Admin ------------------------------- */

export async function adminListPromos(): Promise<Promo[]> {
  return db.select().from(promos).orderBy(desc(promos.updatedAt));
}

export async function adminGetPromo(id: string): Promise<Promo | null> {
  const row = await db.query.promos.findFirst({ where: eq(promos.id, id) });
  return row ?? null;
}

export async function createPromo(data: NewPromo): Promise<Promo> {
  const [row] = await db.insert(promos).values(data).returning();
  return row;
}

export async function updatePromo(
  id: string,
  data: Partial<NewPromo>,
): Promise<Promo | null> {
  const [row] = await db
    .update(promos)
    .set(data)
    .where(eq(promos.id, id))
    .returning();
  return row ?? null;
}

export async function deletePromo(id: string): Promise<void> {
  await db.delete(promos).where(eq(promos.id, id));
}
