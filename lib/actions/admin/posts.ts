"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current";
import {
  createPost,
  deletePost,
  updatePost,
} from "@/lib/db/repositories/posts";
import type { TiptapDoc } from "@/lib/db/schema";
import { postSchema } from "@/lib/validators/admin";
import { firstIssue, friendlyDbError, type AdminActionResult } from "./shared";

function revalidateBlog() {
  revalidatePath("/", "layout");
}

export async function savePost(
  id: string | null,
  input: unknown,
): Promise<AdminActionResult> {
  await requireAdmin();
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  const { relatedStoreIds, contentJson, ...rest } = parsed.data;
  const data = {
    ...rest,
    contentJson: contentJson as TiptapDoc,
    // Publishing without a date means "now".
    publishedAt:
      rest.status === "published" && !rest.publishedAt
        ? new Date()
        : rest.publishedAt,
  };

  try {
    if (id) {
      const row = await updatePost(id, data, relatedStoreIds);
      if (!row) return { ok: false, message: "Post not found." };
      revalidateBlog();
      return { ok: true, message: "Post saved.", id: row.id };
    }
    const row = await createPost(data, relatedStoreIds);
    revalidateBlog();
    return { ok: true, message: "Post created.", id: row.id };
  } catch (err) {
    return { ok: false, message: friendlyDbError(err) };
  }
}

export async function removePost(id: string): Promise<AdminActionResult> {
  await requireAdmin("admin");
  await deletePost(id);
  revalidateBlog();
  return { ok: true, message: "Post deleted." };
}
