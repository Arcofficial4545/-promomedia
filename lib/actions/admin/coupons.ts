"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current";
import {
  bulkSetCouponsActive,
  createCoupon,
  deleteCoupon,
  updateCoupon,
} from "@/lib/db/repositories/coupons";
import { couponSchema } from "@/lib/validators/admin";
import { firstIssue, friendlyDbError, type AdminActionResult } from "./shared";

function revalidateCoupons() {
  revalidatePath("/", "layout");
}

export async function saveCoupon(
  id: string | null,
  input: unknown,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  try {
    if (id) {
      const row = await updateCoupon(id, parsed.data);
      if (!row) return { ok: false, message: "Coupon not found." };
      revalidateCoupons();
      return { ok: true, message: "Coupon updated.", id: row.id };
    }
    const row = await createCoupon(parsed.data);
    revalidateCoupons();
    return { ok: true, message: "Coupon created.", id: row.id };
  } catch (err) {
    return { ok: false, message: friendlyDbError(err) };
  }
}

export async function removeCoupon(id: string): Promise<AdminActionResult> {
  await requireAdmin("admin");
  await deleteCoupon(id);
  revalidateCoupons();
  return { ok: true, message: "Coupon deleted." };
}

export async function setCouponsActive(
  ids: string[],
  isActive: boolean,
): Promise<AdminActionResult> {
  await requireAdmin();
  if (!Array.isArray(ids) || ids.length === 0) {
    return { ok: false, message: "Nothing selected." };
  }
  await bulkSetCouponsActive(ids.slice(0, 200), isActive);
  revalidateCoupons();
  return {
    ok: true,
    message: `${ids.length} coupon${ids.length === 1 ? "" : "s"} ${isActive ? "activated" : "deactivated"}.`,
  };
}
