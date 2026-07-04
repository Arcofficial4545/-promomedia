"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/current";
import { updateSettings } from "@/lib/db/repositories/settings";
import { settingsSchema } from "@/lib/validators/admin";
import { firstIssue, type AdminActionResult } from "./shared";

export async function saveSettings(input: unknown): Promise<AdminActionResult> {
  await requireAdmin("admin");
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: firstIssue(parsed.error) };

  const d = parsed.data;
  await updateSettings({
    siteName: d.siteName,
    seoDefaultTitle: d.seoDefaultTitle,
    seoDefaultDescription: d.seoDefaultDescription,
    footerTagline: d.footerTagline,
    disclosureText: d.disclosureText,
    popupRules: {
      popupsEnabled: d.popupsEnabled,
      globalCooldownHours: d.globalCooldownHours,
      defaultDelayMs: d.defaultDelayMs,
    },
    socialLinks: {
      ...(d.socialX ? { x: d.socialX } : {}),
      ...(d.socialLinkedin ? { linkedin: d.socialLinkedin } : {}),
      ...(d.socialYoutube ? { youtube: d.socialYoutube } : {}),
    },
  });

  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}
