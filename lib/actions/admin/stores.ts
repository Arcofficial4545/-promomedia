"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current";
import {
  createStore,
  deleteStore,
  updateStore,
} from "@/lib/db/repositories/stores";
import { storeSchema } from "@/lib/validators/admin";
import { firstIssue, friendlyDbError, type AdminActionResult } from "./shared";

function revalidateStores() {
  revalidatePath("/", "layout"); // home, directory, categories all show stores
}

export async function saveStore(
  id: string | null,
  input: unknown,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = storeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  const { categoryIds, ...data } = parsed.data;
  try {
    if (id) {
      const row = await updateStore(id, data, categoryIds);
      if (!row) return { ok: false, message: "Store not found." };
      revalidateStores();
      return { ok: true, message: "Store updated.", id: row.id };
    }
    const row = await createStore(data, categoryIds);
    revalidateStores();
    return { ok: true, message: "Store created.", id: row.id };
  } catch (err) {
    return { ok: false, message: friendlyDbError(err) };
  }
}

export async function removeStore(id: string): Promise<AdminActionResult> {
  await requireAdmin("admin");
  await deleteStore(id);
  revalidateStores();
  return { ok: true, message: "Store deleted (and its coupons with it)." };
}
