"use client";

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
import { slugifyClient } from "./utils";

type CategoryOption = { id: string; name: string };

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
};

export function StoreForm({
  store,
  categories,
}: {
  store: StoreWithMeta | null;
  categories: CategoryOption[];
}) {
  const router = useRouter();
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
        <Field label="Slug" htmlFor="store-slug" hint="Used in the URL: /stores/[slug]">
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
