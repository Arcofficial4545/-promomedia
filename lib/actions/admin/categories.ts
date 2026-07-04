"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/db/repositories/categories";
import { categorySchema } from "@/lib/validators/admin";
import { firstIssue, friendlyDbError, type AdminActionResult } from "./shared";

export async function saveCategory(
  id: string | null,
  input: unknown,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  try {
    if (id) {
      const row = await updateCategory(id, parsed.data);
      if (!row) return { ok: false, message: "Category not found." };
      revalidatePath("/", "layout");
      return { ok: true, message: "Category updated.", id: row.id };
    }
    const row = await createCategory(parsed.data);
    revalidatePath("/", "layout");
    return { ok: true, message: "Category created.", id: row.id };
  } catch (err) {
    return { ok: false, message: friendlyDbError(err) };
  }
}

export async function removeCategory(id: string): Promise<AdminActionResult> {
  await requireAdmin("admin");
  await deleteCategory(id);
  revalidatePath("/", "layout");
  return { ok: true, message: "Category deleted." };
}
