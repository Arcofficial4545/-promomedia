"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveComparison } from "@/lib/actions/admin/comparisons";
import type { Comparison, ComparisonCriterion } from "@/lib/db/schema";
import {
  CheckboxField,
  Field,
  inputClasses,
  SubmitButton,
  textareaClasses,
} from "@/components/admin/fields";
import { cn } from "@/lib/utils";
import { slugifyClient } from "./utils";

type StoreOption = { id: string; name: string };

type FormValues = {
  title: string;
  slug: string;
  subtitle: string;
  storeAId: string;
  storeBId: string;
  intro: string;
  criteria: string;
  verdictA: string;
  verdictB: string;
  bottomLine: string;
  status: "draft" | "published";
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
};

const CRITERIA_TEMPLATE = `[
  { "label": "Ease of use", "aText": "…", "bText": "…", "winner": "a" },
  { "label": "Pricing value", "aText": "…", "bText": "…", "winner": "tie", "note": "optional" }
]`;

export function ComparisonForm({
  comparison,
  stores,
}: {
  comparison: Comparison | null;
  stores: StoreOption[];
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { isSubmitting, dirtyFields },
  } = useForm<FormValues>({
    defaultValues: {
      title: comparison?.title ?? "",
      slug: comparison?.slug ?? "",
      subtitle: comparison?.subtitle ?? "",
      storeAId: comparison?.storeAId ?? "",
      storeBId: comparison?.storeBId ?? "",
      intro: comparison?.intro ?? "",
      criteria: comparison?.criteria
        ? JSON.stringify(comparison.criteria, null, 2)
        : "",
      verdictA: comparison?.verdictA ?? "",
      verdictB: comparison?.verdictB ?? "",
      bottomLine: comparison?.bottomLine ?? "",
      status: comparison?.status ?? "draft",
      isFeatured: comparison?.isFeatured ?? false,
      seoTitle: comparison?.seoTitle ?? "",
      seoDescription: comparison?.seoDescription ?? "",
    },
  });

  const nameById = new Map(stores.map((s) => [s.id, s.name]));

  function maybeAutoSlug() {
    if (comparison || dirtyFields.slug) return;
    const a = nameById.get(getValues("storeAId"));
    const b = nameById.get(getValues("storeBId"));
    if (a && b) setValue("slug", slugifyClient(`${a} vs ${b}`));
    if (a && b && !getValues("title")) setValue("title", `${a} vs ${b}`);
  }

  async function onSubmit(values: FormValues) {
    const result = await saveComparison(comparison?.id ?? null, values);
    toast(result.message);
    if (result.ok) router.push("/admin/comparisons");
  }

  // Live preview of the criteria table.
  let preview: ComparisonCriterion[] | null = null;
  let previewError = "";
  const raw = watch("criteria").trim();
  if (raw) {
    try {
      preview = JSON.parse(raw) as ComparisonCriterion[];
    } catch {
      previewError = "Criteria JSON is not valid yet.";
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First tool (A)" htmlFor="cmp-a">
          <select
            id="cmp-a"
            className={inputClasses}
            {...register("storeAId", { onChange: maybeAutoSlug })}
          >
            <option value="">Select…</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Second tool (B)" htmlFor="cmp-b">
          <select
            id="cmp-b"
            className={inputClasses}
            {...register("storeBId", { onChange: maybeAutoSlug })}
          >
            <option value="">Select…</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" htmlFor="cmp-title">
          <input id="cmp-title" className={inputClasses} {...register("title")} />
        </Field>
        <Field label="Slug" htmlFor="cmp-slug" hint="/compare/[slug]">
          <input id="cmp-slug" className={inputClasses} {...register("slug")} />
        </Field>
      </div>

      <Field label="Subtitle" htmlFor="cmp-subtitle">
        <input id="cmp-subtitle" className={inputClasses} {...register("subtitle")} />
      </Field>

      <Field label="Intro" htmlFor="cmp-intro">
        <textarea id="cmp-intro" rows={3} className={textareaClasses} {...register("intro")} />
      </Field>

      <Field
        label="Criteria (JSON)"
        htmlFor="cmp-criteria"
        hint={`Array of {label, aText, bText, winner: "a"|"b"|"tie", note?}`}
      >
        <textarea
          id="cmp-criteria"
          rows={8}
          placeholder={CRITERIA_TEMPLATE}
          className={cn(textareaClasses, "font-mono text-xs")}
          {...register("criteria")}
        />
      </Field>

      {/* Live preview */}
      {raw && (
        <div className="rounded-[var(--radius-card)] border border-line bg-mint/20 p-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-ink-subtle uppercase">
            Criteria preview
          </p>
          {previewError ? (
            <p className="text-sm text-danger">{previewError}</p>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {(preview ?? []).map((row, i) => (
                  <tr key={i} className="border-b border-line/60 last:border-0">
                    <td className="py-1.5 pr-3 font-medium text-ink">{row.label}</td>
                    <td className="py-1.5 pr-3 text-ink-muted">{row.aText}</td>
                    <td className="py-1.5 pr-3 text-ink-muted">{row.bText}</td>
                    <td className="py-1.5 font-mono text-emerald-700">{row.winner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Choose A if…" htmlFor="cmp-va">
          <textarea id="cmp-va" rows={2} className={textareaClasses} {...register("verdictA")} />
        </Field>
        <Field label="Choose B if…" htmlFor="cmp-vb">
          <textarea id="cmp-vb" rows={2} className={textareaClasses} {...register("verdictB")} />
        </Field>
      </div>

      <Field label="Bottom line" htmlFor="cmp-bottom">
        <textarea id="cmp-bottom" rows={3} className={textareaClasses} {...register("bottomLine")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="SEO title" htmlFor="cmp-seo-title">
          <input id="cmp-seo-title" className={inputClasses} {...register("seoTitle")} />
        </Field>
        <Field label="SEO description" htmlFor="cmp-seo-desc">
          <input id="cmp-seo-desc" className={inputClasses} {...register("seoDescription")} />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <Field label="Status" htmlFor="cmp-status">
          <select id="cmp-status" className={inputClasses} {...register("status")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <div className="pt-6">
          <CheckboxField label="Featured" {...register("isFeatured")} />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-5">
        <SubmitButton pending={isSubmitting}>
          {comparison ? "Save comparison" : "Create comparison"}
        </SubmitButton>
        <button
          type="button"
          onClick={() => router.push("/admin/comparisons")}
          className="text-sm font-medium text-ink-muted hover:text-pine"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
