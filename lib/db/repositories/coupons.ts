import "server-only";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  inArray,
  isNull,
  like,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../client";
import {
  categories,
  coupons,
  storeCategories,
  stores,
  type Coupon,
  type NewCoupon,
  type Store,
} from "../schema";

export type CouponWithStore = Coupon & {
  store: Pick<
    Store,
    "id" | "name" | "slug" | "logoUrl" | "websiteUrl" | "affiliateBaseUrl"
  >;
};

export type CouponSort = "featured" | "newest" | "expiring" | "popular";

const storeCols = {
  id: stores.id,
  name: stores.name,
  slug: stores.slug,
  logoUrl: stores.logoUrl,
  websiteUrl: stores.websiteUrl,
  affiliateBaseUrl: stores.affiliateBaseUrl,
};

function isLiveNow() {
  const now = new Date();
  return and(
    eq(coupons.isActive, true),
    eq(stores.isActive, true),
    or(isNull(coupons.expiresAt), gt(coupons.expiresAt, now)),
    or(isNull(coupons.startsAt), lte(coupons.startsAt, now)),
  );
}

function orderFor(sort: CouponSort) {
  switch (sort) {
    case "newest":
      return [desc(coupons.createdAt)];
    case "expiring":
      return [sql`${coupons.expiresAt} is null`, asc(coupons.expiresAt)];
    case "popular":
      return [desc(coupons.clickCount), desc(coupons.sortWeight)];
    default:
      return [
        desc(coupons.sortWeight),
        desc(coupons.isVerified),
        desc(coupons.clickCount),
      ];
  }
}

export async function listActiveCoupons(opts?: {
  search?: string;
  categorySlug?: string;
  type?: "code" | "deal";
  sort?: CouponSort;
  limit?: number;
  offset?: number;
}): Promise<{ coupons: CouponWithStore[]; total: number }> {
  const { search, categorySlug, type, sort = "featured", limit = 24, offset = 0 } =
    opts ?? {};

  const conditions = [isLiveNow()];

  if (type) conditions.push(eq(coupons.type, type));

  if (search) {
    const term = `%${search.replace(/[%_]/g, "")}%`;
    conditions.push(
      or(
        like(coupons.title, term),
        like(coupons.discountLabel, term),
        like(stores.name, term),
      ),
    );
  }

  if (categorySlug) {
    const storeIds = (
      await db
        .select({ storeId: storeCategories.storeId })
        .from(storeCategories)
        .innerJoin(categories, eq(storeCategories.categoryId, categories.id))
        .where(eq(categories.slug, categorySlug))
    ).map((r) => r.storeId);
    if (storeIds.length === 0) return { coupons: [], total: 0 };
    conditions.push(inArray(coupons.storeId, storeIds));
  }

  const where = and(...conditions);

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ coupon: coupons, store: storeCols })
      .from(coupons)
      .innerJoin(stores, eq(coupons.storeId, stores.id))
      .where(where)
      .orderBy(...orderFor(sort))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(coupons)
      .innerJoin(stores, eq(coupons.storeId, stores.id))
      .where(where),
  ]);

  return {
    coupons: rows.map((r) => ({ ...r.coupon, store: r.store })),
    total,
  };
}

export async function listCouponsForStore(storeId: string): Promise<{
  active: CouponWithStore[];
  expired: CouponWithStore[];
}> {
  const rows = await db
    .select({ coupon: coupons, store: storeCols })
    .from(coupons)
    .innerJoin(stores, eq(coupons.storeId, stores.id))
    .where(and(eq(coupons.storeId, storeId), eq(coupons.isActive, true)))
    .orderBy(desc(coupons.sortWeight), desc(coupons.isVerified));

  const now = Date.now();
  const active: CouponWithStore[] = [];
  const expired: CouponWithStore[] = [];
  for (const r of rows) {
    const c = { ...r.coupon, store: r.store };
    if (c.expiresAt && c.expiresAt.getTime() <= now) expired.push(c);
    else active.push(c);
  }
  return { active, expired };
}

export async function getCouponById(
  couponId: string,
): Promise<CouponWithStore | null> {
  const rows = await db
    .select({ coupon: coupons, store: storeCols })
    .from(coupons)
    .innerJoin(stores, eq(coupons.storeId, stores.id))
    .where(eq(coupons.id, couponId))
    .limit(1);
  if (rows.length === 0) return null;
  return { ...rows[0].coupon, store: rows[0].store };
}

export async function getCouponsByIds(
  ids: string[],
): Promise<CouponWithStore[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .select({ coupon: coupons, store: storeCols })
    .from(coupons)
    .innerJoin(stores, eq(coupons.storeId, stores.id))
    .where(inArray(coupons.id, ids));
  return rows.map((r) => ({ ...r.coupon, store: r.store }));
}

export async function incrementRevealCount(couponId: string): Promise<void> {
  await db
    .update(coupons)
    .set({ revealCount: sql`${coupons.revealCount} + 1` })
    .where(eq(coupons.id, couponId));
}

export async function incrementClickCount(couponId: string): Promise<void> {
  await db
    .update(coupons)
    .set({ clickCount: sql`${coupons.clickCount} + 1` })
    .where(eq(coupons.id, couponId));
}

export async function countActiveCoupons(): Promise<number> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(coupons)
    .innerJoin(stores, eq(coupons.storeId, stores.id))
    .where(isLiveNow());
  return total;
}

/* ------------------------------- Admin ------------------------------- */

export async function adminListCoupons(): Promise<CouponWithStore[]> {
  const rows = await db
    .select({ coupon: coupons, store: storeCols })
    .from(coupons)
    .innerJoin(stores, eq(coupons.storeId, stores.id))
    .orderBy(desc(coupons.createdAt));
  return rows.map((r) => ({ ...r.coupon, store: r.store }));
}

export async function createCoupon(data: NewCoupon): Promise<Coupon> {
  const [row] = await db.insert(coupons).values(data).returning();
  return row;
}

export async function updateCoupon(
  id: string,
  data: Partial<NewCoupon>,
): Promise<Coupon | null> {
  const [row] = await db
    .update(coupons)
    .set(data)
    .where(eq(coupons.id, id))
    .returning();
  return row ?? null;
}

export async function deleteCoupon(id: string): Promise<void> {
  await db.delete(coupons).where(eq(coupons.id, id));
}

export async function bulkSetCouponsActive(
  ids: string[],
  isActive: boolean,
): Promise<void> {
  if (ids.length === 0) return;
  await db.update(coupons).set({ isActive }).where(inArray(coupons.id, ids));
}
