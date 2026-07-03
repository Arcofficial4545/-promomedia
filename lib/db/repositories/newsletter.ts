import "server-only";
import { count, desc, eq, gte } from "drizzle-orm";
import { db } from "../client";
import { newsletterSubscribers, type NewsletterSubscriber } from "../schema";

export async function subscribeEmail(
  email: string,
  source: string,
): Promise<{ ok: true; already: boolean }> {
  const normalized = email.trim().toLowerCase();
  const existing = await db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribers.email, normalized),
  });
  if (existing) return { ok: true, already: true };
  await db.insert(newsletterSubscribers).values({
    email: normalized,
    source,
    confirmedAt: new Date(),
  });
  return { ok: true, already: false };
}

export async function countSubscribers(): Promise<number> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(newsletterSubscribers);
  return total;
}

export async function countSubscribersSince(since: Date): Promise<number> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(newsletterSubscribers)
    .where(gte(newsletterSubscribers.createdAt, since));
  return total;
}

export async function listSubscribers(): Promise<NewsletterSubscriber[]> {
  return db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.createdAt));
}
