import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../client";
import { codeFeedback, coupons } from "../schema";

/**
 * Record one code-feedback vote. Deduped per visitor per coupon (unique
 * index); denormalizes works/fails onto the coupon in the same transaction.
 * Returns whether the vote counted (false if the visitor already voted).
 */
export async function recordCodeVote(input: {
  couponId: string;
  worked: boolean;
  visitorHash: string;
}): Promise<{ counted: boolean }> {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: codeFeedback.id })
      .from(codeFeedback)
      .where(
        and(
          eq(codeFeedback.couponId, input.couponId),
          eq(codeFeedback.visitorHash, input.visitorHash),
        ),
      )
      .limit(1);
    if (existing.length > 0) return { counted: false };

    await tx.insert(codeFeedback).values({
      couponId: input.couponId,
      worked: input.worked,
      visitorHash: input.visitorHash,
    });

    await tx
      .update(coupons)
      .set(
        input.worked
          ? { worksCount: sql`${coupons.worksCount} + 1` }
          : { failsCount: sql`${coupons.failsCount} + 1` },
      )
      .where(eq(coupons.id, input.couponId));

    return { counted: true };
  });
}
