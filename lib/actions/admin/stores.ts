"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current";
import {
  adminGetStore,
  adminListStores,
  createStore,
  deleteStore,
  updateStore,
} from "@/lib/db/repositories/stores";
import { fetchBrandAssets } from "@/lib/brand/fetchAssets";
import type { NewStore } from "@/lib/db/schema";
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

  const { categoryIds, ...rest } = parsed.data;
  // The JSON textarea fields parse to `unknown`; they are shaped by the form.
  const data = rest as unknown as Partial<NewStore>;
  // Auto-stamp the review date when a score exists and no manual date was set.
  if (data.editorialScore != null && !data.lastReviewedAt) {
    data.lastReviewedAt = new Date();
  }
  try {
    if (id) {
      const row = await updateStore(id, data, categoryIds);
      if (!row) return { ok: false, message: "Store not found." };
      revalidateStores();
      return { ok: true, message: "Store updated.", id: row.id };
    }
    const row = await createStore(data as NewStore, categoryIds);
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

/** Re-fetch logo + cover + theme-color for one store from its public site. */
export async function refetchStoreAssets(
  id: string,
): Promise<AdminActionResult> {
  await requireAdmin();
  const store = await adminGetStore(id);
  if (!store) return { ok: false, message: "Store not found." };
  if (!store.websiteUrl) {
    return { ok: false, message: "This store has no website URL to fetch from." };
  }
  try {
    const r = await fetchBrandAssets({
      slug: store.slug,
      websiteUrl: store.websiteUrl,
    });
    await updateStore(id, {
      logoUrl: r.logoUrl ?? store.logoUrl,
      coverImageUrl: r.coverImageUrl ?? store.coverImageUrl,
      themeColor: r.themeColor ?? store.themeColor,
    });
    revalidateStores();
    return r.logoUrl
      ? { ok: true, message: `Fetched brand assets (${r.logoSource}).` }
      : { ok: false, message: "No logo found — the letter tile stays." };
  } catch (err) {
    return { ok: false, message: friendlyDbError(err) };
  }
}

/** Bulk re-fetch across all active, non-fictional stores. */
export async function refetchAllStoreAssets(): Promise<AdminActionResult> {
  await requireAdmin();
  const stores = await adminListStores();
  let ok = 0;
  let unchanged = 0;
  for (const s of stores) {
    if (s.isFictional || !s.websiteUrl) continue;
    try {
      const r = await fetchBrandAssets({ slug: s.slug, websiteUrl: s.websiteUrl });
      await updateStore(s.id, {
        logoUrl: r.logoUrl ?? s.logoUrl,
        coverImageUrl: r.coverImageUrl ?? s.coverImageUrl,
        themeColor: r.themeColor ?? s.themeColor,
      });
      if (r.logoUrl) ok++;
      else unchanged++;
    } catch {
      unchanged++;
    }
  }
  revalidateStores();
  return { ok: true, message: `Refetched ${ok} logo(s); ${unchanged} unchanged.` };
}
