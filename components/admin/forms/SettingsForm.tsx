"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveSettings } from "@/lib/actions/admin/settings";
import type { Settings } from "@/lib/db/schema";
import {
  CheckboxField,
  Field,
  inputClasses,
  SubmitButton,
  textareaClasses,
} from "@/components/admin/fields";

type FormValues = {
  siteName: string;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  footerTagline: string;
  disclosureText: string;
  popupsEnabled: boolean;
  globalCooldownHours: number;
  defaultDelayMs: number;
  socialX: string;
  socialLinkedin: string;
  socialYoutube: string;
};

export function SettingsForm({ settings }: { settings: Settings }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      siteName: settings.siteName,
      seoDefaultTitle: settings.seoDefaultTitle,
      seoDefaultDescription: settings.seoDefaultDescription,
      footerTagline: settings.footerTagline,
      disclosureText: settings.disclosureText,
      popupsEnabled: settings.popupRules.popupsEnabled,
      globalCooldownHours: settings.popupRules.globalCooldownHours,
      defaultDelayMs: settings.popupRules.defaultDelayMs,
      socialX: settings.socialLinks.x ?? "",
      socialLinkedin: settings.socialLinks.linkedin ?? "",
      socialYoutube: settings.socialLinks.youtube ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    const result = await saveSettings(values);
    toast(result.message);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-5">
      <div className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6">
        <h2 className="font-display font-semibold text-pine">Site & SEO</h2>
        <Field label="Site name" htmlFor="set-name">
          <input id="set-name" className={inputClasses} {...register("siteName")} />
        </Field>
        <Field label="Default SEO title" htmlFor="set-seo-title">
          <input id="set-seo-title" className={inputClasses} {...register("seoDefaultTitle")} />
        </Field>
        <Field label="Default SEO description" htmlFor="set-seo-desc">
          <textarea
            id="set-seo-desc"
            rows={2}
            className={textareaClasses}
            {...register("seoDefaultDescription")}
          />
        </Field>
      </div>

      <div className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6">
        <h2 className="font-display font-semibold text-pine">Footer & disclosure</h2>
        <Field label="Footer tagline" htmlFor="set-footer">
          <textarea
            id="set-footer"
            rows={2}
            className={textareaClasses}
            {...register("footerTagline")}
          />
        </Field>
        <Field label="Disclosure line" htmlFor="set-disclosure" hint="Shown quietly in the footer and on /disclosure.">
          <textarea
            id="set-disclosure"
            rows={3}
            className={textareaClasses}
            {...register("disclosureText")}
          />
        </Field>
      </div>

      <div className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6">
        <h2 className="font-display font-semibold text-pine">Popup rules</h2>
        <CheckboxField label="Popups enabled (global kill switch)" {...register("popupsEnabled")} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Global cooldown (hours)"
            htmlFor="set-cooldown"
            hint="Minimum time between any two popups for one visitor."
          >
            <input
              id="set-cooldown"
              type="number"
              min={0}
              max={720}
              className={inputClasses}
              {...register("globalCooldownHours", { valueAsNumber: true })}
            />
          </Field>
          <Field label="Default timed-popup delay (ms)" htmlFor="set-delay">
            <input
              id="set-delay"
              type="number"
              min={0}
              step={500}
              className={inputClasses}
              {...register("defaultDelayMs", { valueAsNumber: true })}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6">
        <h2 className="font-display font-semibold text-pine">Social links</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="X" htmlFor="set-x">
            <input id="set-x" type="url" placeholder="https://x.com/..." className={inputClasses} {...register("socialX")} />
          </Field>
          <Field label="LinkedIn" htmlFor="set-li">
            <input id="set-li" type="url" placeholder="https://linkedin.com/..." className={inputClasses} {...register("socialLinkedin")} />
          </Field>
          <Field label="YouTube" htmlFor="set-yt">
            <input id="set-yt" type="url" placeholder="https://youtube.com/..." className={inputClasses} {...register("socialYoutube")} />
          </Field>
        </div>
      </div>

      <SubmitButton pending={isSubmitting}>Save settings</SubmitButton>
    </form>
  );
}
