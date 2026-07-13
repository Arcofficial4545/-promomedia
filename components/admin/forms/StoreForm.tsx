"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveStore } from "@/lib/actions/admin/stores";
import type { StoreWithMeta } from "@/lib/db/repositories/stores";
import {
  CheckboxField,
  Field,
  inputClasses,
  SubmitButton,
  textareaClasses,
} from "@/components/admin/fields";
import { LogoUploadField } from "@/components/admin/forms/LogoUploadField";
import { cn } from "@/lib/utils";
import { slugifyClient } from "./utils";

type CategoryOption = { id: string; name: string };
type StoreOption = { slug: string; name: string };

type FormValues = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  affiliateBaseUrl: string;
  logoUrl: string;
  rating: number;
  isFeatured: boolean;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
  categoryIds: string[];
  // Review
  editorialScore: string;
  heroSummary: string;
  verdict: string;
  useItFor: string;
  skipItIf: string;
  startingPriceLabel: string;
  pricingUrl: string;
  goodPoints: string;
  weakPoints: string;
  screenshots: string;
  alternativeSlugs: string[];
  ratingBreakdown: string;
  pricingSummary: string;
  faq: string;
  reviewBody: string;
  lastReviewedAt: string;
};

function jsonDefault(value: unknown): string {
  return value ? JSON.stringify(value, null, 2) : "";
}

export function StoreForm({
  store,
  categories,
  allStores,
}: {
  store: StoreWithMeta | null;
  categories: CategoryOption[];
  allStores: StoreOption[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"details" | "review">("details");
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, dirtyFields },
  } = useForm<FormValues>({
    defaultValues: {
      name: store?.name ?? "",
      slug: store?.slug ?? "",
      tagline: store?.tagline ?? "",
      description: store?.description ?? "",
      websiteUrl: store?.websiteUrl ?? "",
      affiliateBaseUrl: store?.affiliateBaseUrl ?? "",
      logoUrl: store?.logoUrl ?? "",
      rating: store?.rating ?? 0,
      isFeatured: store?.isFeatured ?? false,
      isActive: store?.isActive ?? true,
      seoTitle: store?.seoTitle ?? "",
      seoDescription: store?.seoDescription ?? "",
      categoryIds: store?.categories.map((c) => c.id) ?? [],
      editorialScore: store?.editorialScore?.toString() ?? "",
      heroSummary: store?.heroSummary ?? "",
      verdict: store?.verdict ?? "",
      useItFor: store?.useItFor ?? "",
      skipItIf: store?.skipItIf ?? "",
      startingPriceLabel: store?.startingPriceLabel ?? "",
      pricingUrl: store?.pricingUrl ?? "",
      goodPoints: (store?.goodPoints ?? []).join("\n"),
      weakPoints: (store?.weakPoints ?? []).join("\n"),
      screenshots: (store?.screenshots ?? []).join("\n"),
      alternativeSlugs: store?.alternativeSlugs ?? [],
      ratingBreakdown: jsonDefault(store?.ratingBreakdown),
      pricingSummary: jsonDefault(store?.pricingSummary),
      faq: jsonDefault(store?.faq),
      reviewBody: jsonDefault(store?.reviewBody),
      lastReviewedAt: store?.lastReviewedAt
        ? new Date(store.lastReviewedAt).toISOString().slice(0, 10)
        : "",
    },
  });

  async function onSubmit(values: FormValues) {
    const result = await saveStore(store?.id ?? null, values);
    toast(result.message);
    if (result.ok) router.push("/admin/stores");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6"
    >
      {/* Tabs */}
      <div className="flex gap-1 border-b border-line">
        {(["details", "review"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "border-emerald text-pine"
                : "border-transparent text-ink-muted hover:text-pine",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ------------------------------------------------ Details tab */}
      <div className={cn("space-y-5", tab !== "details" && "hidden")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="store-name">
            <input
              id="store-name"
              className={inputClasses}
              {...register("name", {
                onChange: (e) => {
                  if (!store && !dirtyFields.slug) {
                    setValue("slug", slugifyClient(e.target.value));
                  }
                },
              })}
            />
          </Field>
          <Field label="Slug" htmlFor="store-slug" hint="Used in the URL: /tools/[slug]">
            <input id="store-slug" className={inputClasses} {...register("slug")} />
          </Field>
        </div>

        <Field label="Tagline" htmlFor="store-tagline">
          <input id="store-tagline" className={inputClasses} {...register("tagline")} />
        </Field>

        <Field label="Description" htmlFor="store-description">
          <textarea
            id="store-description"
            rows={5}
            className={textareaClasses}
            {...register("description")}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Website URL" htmlFor="store-website">
            <input
              id="store-website"
              type="url"
              placeholder="https://..."
              className={inputClasses}
              {...register("websiteUrl")}
            />
          </Field>
          <Field
            label="Partner destination URL"
            htmlFor="store-affiliate"
            hint="Where tracked clicks land. Falls back to the website URL."
          >
            <input
              id="store-affiliate"
              type="url"
              placeholder="https://..."
              className={inputClasses}
              {...register("affiliateBaseUrl")}
            />
          </Field>
        </div>

        <LogoUploadField
          value={watch("logoUrl")}
          onChange={(url) => setValue("logoUrl", url, { shouldDirty: true })}
          storeName={watch("name")}
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Rating (0–5)" htmlFor="store-rating">
            <input
              id="store-rating"
              type="number"
              step="0.1"
              min={0}
              max={5}
              className={inputClasses}
              {...register("rating", { valueAsNumber: true })}
            />
          </Field>
          <div className="flex items-end gap-5 pb-2">
            <CheckboxField label="Featured" {...register("isFeatured")} />
            <CheckboxField label="Active" {...register("isActive")} />
          </div>
        </div>

        <Field label="Categories">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {categories.map((cat) => (
              <CheckboxField
                key={cat.id}
                label={cat.name}
                value={cat.id}
                {...register("categoryIds")}
              />
            ))}
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="SEO title" htmlFor="store-seo-title">
            <input id="store-seo-title" className={inputClasses} {...register("seoTitle")} />
          </Field>
          <Field label="SEO description" htmlFor="store-seo-desc">
            <input id="store-seo-desc" className={inputClasses} {...register("seoDescription")} />
          </Field>
        </div>
      </div>

      {/* ------------------------------------------------ Review tab */}
      <div className={cn("space-y-5", tab !== "review" && "hidden")}>
        <p className="text-sm text-ink-muted">
          A review renders publicly once it has a verdict, a score, and at least
          two pros and two cons. Leave the score blank for &ldquo;review in
          progress&rdquo;.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Editorial score (0–10)" htmlFor="store-score">
            <input
              id="store-score"
              type="number"
              step="0.1"
              min={0}
              max={10}
              className={inputClasses}
              {...register("editorialScore")}
            />
          </Field>
          <Field
            label="Reviewed date"
            htmlFor="store-reviewed"
            hint="Auto-set to today on save when blank and a score exists."
          >
            <input
              id="store-reviewed"
              type="date"
              className={inputClasses}
              {...register("lastReviewedAt")}
            />
          </Field>
        </div>

        <Field label="Hero summary" htmlFor="store-hero" hint="One-paragraph positioning shown in the masthead.">
          <textarea id="store-hero" rows={3} className={textareaClasses} {...register("heroSummary")} />
        </Field>

        <Field label="Verdict" htmlFor="store-verdict" hint="2–3 sentence bottom line — include the catch.">
          <textarea id="store-verdict" rows={3} className={textareaClasses} {...register("verdict")} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Best for" htmlFor="store-usefor">
            <textarea id="store-usefor" rows={2} className={textareaClasses} {...register("useItFor")} />
          </Field>
          <Field label="Not for" htmlFor="store-skipif">
            <textarea id="store-skipif" rows={2} className={textareaClasses} {...register("skipItIf")} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Pros (one per line)" htmlFor="store-good">
            <textarea id="store-good" rows={4} className={textareaClasses} {...register("goodPoints")} />
          </Field>
          <Field label="Cons (one per line)" htmlFor="store-weak">
            <textarea id="store-weak" rows={4} className={textareaClasses} {...register("weakPoints")} />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Starting price label" htmlFor="store-startprice" hint='e.g. "Free plan · paid from $16/mo"'>
            <input id="store-startprice" className={inputClasses} {...register("startingPriceLabel")} />
          </Field>
          <Field label="Pricing page URL" htmlFor="store-priceurl">
            <input id="store-priceurl" type="url" placeholder="https://..." className={inputClasses} {...register("pricingUrl")} />
          </Field>
        </div>

        <Field
          label="Scorecard criteria (JSON)"
          htmlFor="store-rating-json"
          hint='Array of {"label","score"}, e.g. [{"label":"Ease of use","score":9}]'
        >
          <textarea id="store-rating-json" rows={5} className={cn(textareaClasses, "font-mono text-xs")} {...register("ratingBreakdown")} />
        </Field>

        <Field
          label="Pricing rows (JSON)"
          htmlFor="store-pricing-json"
          hint='Array of {"plan","price","note"}'
        >
          <textarea id="store-pricing-json" rows={4} className={cn(textareaClasses, "font-mono text-xs")} {...register("pricingSummary")} />
        </Field>

        <Field
          label="FAQ (JSON)"
          htmlFor="store-faq-json"
          hint='Array of {"q","a"}'
        >
          <textarea id="store-faq-json" rows={4} className={cn(textareaClasses, "font-mono text-xs")} {...register("faq")} />
        </Field>

        <Field
          label="Review body (Tiptap JSON)"
          htmlFor="store-body-json"
          hint='Advanced: a Tiptap doc, e.g. {"type":"doc","content":[...]}'
        >
          <textarea id="store-body-json" rows={6} className={cn(textareaClasses, "font-mono text-xs")} {...register("reviewBody")} />
        </Field>

        <Field label="Screenshot URLs (one per line)" htmlFor="store-shots">
          <textarea id="store-shots" rows={3} className={textareaClasses} {...register("screenshots")} />
        </Field>

        <Field label="Alternatives (pick up to 3)">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {allStores.map((s) => (
              <CheckboxField
                key={s.slug}
                label={s.name}
                value={s.slug}
                {...register("alternativeSlugs")}
              />
            ))}
          </div>
        </Field>
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-5">
        <SubmitButton pending={isSubmitting}>
          {store ? "Save store" : "Create store"}
        </SubmitButton>
        <button
          type="button"
          onClick={() => router.push("/admin/stores")}
          className="text-sm font-medium text-ink-muted hover:text-pine"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
