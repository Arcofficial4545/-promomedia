import "server-only";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Storage adapter interface. Local filesystem today; a Supabase Storage
 * implementation can replace `localStorageAdapter` without touching feature
 * code — see DATA_LAYER.md.
 */
export type StorageAdapter = {
  /** Persist a file, returns its public URL. */
  put(input: {
    data: Uint8Array;
    filename: string;
    contentType?: string;
  }): Promise<{ url: string }>;
  /** Delete by public URL. No-op when the file doesn't exist. */
  delete(url: string): Promise<void>;
  /** List stored file URLs (media library). */
  list(): Promise<{ url: string; size: number; modifiedAt: Date }[]>;
};

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads";

function safeName(filename: string): string {
  const ext = path.extname(filename).toLowerCase().slice(0, 10);
  const base = path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "file"}-${randomUUID().slice(0, 8)}${ext}`;
}

const localStorageAdapter: StorageAdapter = {
  async put({ data, filename }) {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const name = safeName(filename);
    await fs.writeFile(path.join(UPLOADS_DIR, name), data);
    return { url: `${PUBLIC_PREFIX}/${name}` };
  },

  async delete(url) {
    if (!url.startsWith(`${PUBLIC_PREFIX}/`)) return;
    const name = path.basename(url);
    try {
      await fs.unlink(path.join(UPLOADS_DIR, name));
    } catch {
      // already gone
    }
  },

  async list() {
    try {
      const entries = await fs.readdir(UPLOADS_DIR);
      const files = await Promise.all(
        entries
          .filter((e) => !e.startsWith("."))
          .map(async (e) => {
            const stat = await fs.stat(path.join(UPLOADS_DIR, e));
            return {
              url: `${PUBLIC_PREFIX}/${e}`,
              size: stat.size,
              modifiedAt: stat.mtime,
            };
          }),
      );
      return files.sort(
        (a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime(),
      );
    } catch {
      return [];
    }
  },
};

export const storage: StorageAdapter = localStorageAdapter;
