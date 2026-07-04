"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current";
import { markContactMessageRead } from "@/lib/db/repositories/contact";
import type { AdminActionResult } from "./shared";

export async function markMessageRead(id: string): Promise<AdminActionResult> {
  await requireAdmin();
  await markContactMessageRead(id);
  revalidatePath("/admin/messages");
  return { ok: true, message: "Marked as read." };
}
