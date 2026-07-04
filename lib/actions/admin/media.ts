"use server";

import { requireAdmin } from "@/lib/auth/current";
import { storage } from "@/lib/adapters/storage";
import type { AdminActionResult } from "./shared";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
]);

export type UploadResult = AdminActionResult & { url?: string };

export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose a file to upload." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "Max file size is 4 MB." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, message: "Images only (png, jpg, webp, svg, gif)." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { url } = await storage.put({
    data: bytes,
    filename: file.name,
    contentType: file.type,
  });
  return { ok: true, message: "Uploaded.", url };
}

export async function deleteMedia(url: string): Promise<AdminActionResult> {
  await requireAdmin("admin");
  if (typeof url !== "string" || !url.startsWith("/uploads/")) {
    return { ok: false, message: "Invalid file." };
  }
  await storage.delete(url);
  return { ok: true, message: "File deleted." };
}
