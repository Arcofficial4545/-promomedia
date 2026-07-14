import "server-only";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "../client";
import { clicks, coupons, posts, stores, type NewClick } from "../schema";

export async function logClick(data: NewClick): Promise<void> {
  await db.insert(clicks).values(data);
}

export async function countClicksSince(since: Date): Promise<number> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(clicks)
    .where(gte(clicks.createdAt, since));
  return total;
}

export async function clicksPerDay(
  since: Date,
): Promise<{ day: string; clicks: number }[]> {
  const day = sql<string>`to_char(${clicks.createdAt}, 'YYYY-MM-DD')`;
  const rows = await db
    .select({
      day,
      clicks: count(),
    })
    .from(clicks)
    .where(gte(clicks.createdAt, since))
    .groupBy(day)
    .orderBy(day);
  return rows;
}

export async function topCouponsByClicks(
  since: Date,
  limit = 10,
): Promise<
  { couponId: string; title: string; storeName: string; clicks: number }[]
> {
  const rows = await db
    .select({
      couponId: coupons.id,
      title: coupons.title,
      storeName: stores.name,
      clicks: count(clicks.id),
    })
    .from(clicks)
    .innerJoin(coupons, eq(clicks.couponId, coupons.id))
    .innerJoin(stores, eq(coupons.storeId, stores.id))
    .where(gte(clicks.createdAt, since))
    .groupBy(coupons.id)
    .orderBy(desc(count(clicks.id)))
    .limit(limit);
  return rows;
}

export async function topStoresByClicks(
  since: Date,
  limit = 10,
): Promise<{ storeId: string; storeName: string; clicks: number }[]> {
  const rows = await db
    .select({
      storeId: stores.id,
      storeName: stores.name,
      clicks: count(clicks.id),
    })
    .from(clicks)
    .innerJoin(stores, eq(clicks.storeId, stores.id))
    .where(gte(clicks.createdAt, since))
    .groupBy(stores.id)
    .orderBy(desc(count(clicks.id)))
    .limit(limit);
  return rows;
}

export async function topPostsByViews(
  limit = 10,
): Promise<{ postId: string; title: string; views: number }[]> {
  const rows = await db
    .select({ postId: posts.id, title: posts.title, views: posts.viewCount })
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.viewCount))
    .limit(limit);
  return rows;
}

export async function recentClicks(limit = 20) {
  return db
    .select({
      id: clicks.id,
      path: clicks.path,
      createdAt: clicks.createdAt,
      couponTitle: coupons.title,
      storeName: stores.name,
    })
    .from(clicks)
    .leftJoin(coupons, eq(clicks.couponId, coupons.id))
    .leftJoin(stores, eq(clicks.storeId, stores.id))
    .orderBy(desc(clicks.createdAt))
    .limit(limit);
}

export async function exportClicksSince(since: Date) {
  return db
    .select({
      createdAt: clicks.createdAt,
      path: clicks.path,
      referer: clicks.referer,
      country: clicks.country,
      couponTitle: coupons.title,
      storeName: stores.name,
    })
    .from(clicks)
    .leftJoin(coupons, eq(clicks.couponId, coupons.id))
    .leftJoin(stores, eq(clicks.storeId, stores.id))
    .where(and(gte(clicks.createdAt, since)))
    .orderBy(desc(clicks.createdAt));
}
