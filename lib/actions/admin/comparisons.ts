"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current";
import {
  createComparison,
  deleteComparison,
  updateComparison,
} from "@/lib/db/repositories/comparisons";
import type { ComparisonCriterion } from "@/lib/db/schema";
import { comparisonSchema } from "@/lib/validators/admin";
import { firstIssue, friendlyDbError, type AdminActionResult } from "./shared";

function revalidateComparisons() {
  revalidatePath("/", "layout"); // hub, home band, and tool pages link matchups
}

export async function saveComparison(
  id: string | null,
  input: unknown,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = comparisonSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  const data = {
    ...parsed.data,
    criteria: parsed.data.criteria as ComparisonCriterion[],
  };
  try {
    if (id) {
      const row = await updateComparison(id, data);
      if (!row) return { ok: false, message: "Comparison not found." };
      revalidateComparisons();
      return { ok: true, message: "Comparison updated.", id: row.id };
    }
    const row = await createComparison(data);
    revalidateComparisons();
    return { ok: true, message: "Comparison created.", id: row.id };
  } catch (err) {
    return { ok: false, message: friendlyDbError(err) };
  }
}

export async function removeComparison(id: string): Promise<AdminActionResult> {
  await requireAdmin("admin");
  await deleteComparison(id);
  revalidateComparisons();
  return { ok: true, message: "Comparison deleted." };
}
