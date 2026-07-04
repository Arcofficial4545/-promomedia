"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveCategory } from "@/lib/actions/admin/categories";
import type { Category } from "@/lib/db/schema";
import {
  Field,
  inputClasses,
  SubmitButton,
  textareaClasses,
} from "@/components/admin/fields";
import { slugifyClient } from "./utils";

type FormValues = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
};

const ICON_OPTIONS = [
  "bot",
  "blocks",
  "cloud",
  "calculator",
  "shopping-cart",
  "pen-tool",
  "list-checks",
  "megaphone",
  "tag",
];

export function CategoryForm({ category }: { category: Category | null }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, dirtyFields },
  } = useForm<FormValues>({
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      icon: category?.icon ?? "tag",
      sortOrder: category?.sortOrder ?? 0,
    },
  });

  async function onSubmit(values: FormValues) {
    const result = await saveCategory(category?.id ?? null, values);
    toast(result.message);
    if (result.ok) router.push("/admin/categories");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="cat-name">
          <input
            id="cat-name"
            className={inputClasses}
            {...register("name", {
              onChange: (e) => {
                if (!category && !dirtyFields.slug) {
                  setValue("slug", slugifyClient(e.target.value));
                }
              },
            })}
          />
        </Field>
        <Field label="Slug" htmlFor="cat-slug">
          <input id="cat-slug" className={inputClasses} {...register("slug")} />
        </Field>
      </div>

      <Field label="Description" htmlFor="cat-description">
        <textarea
          id="cat-description"
          rows={3}
          className={textareaClasses}
          {...register("description")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Icon" htmlFor="cat-icon" hint="Lucide icon name.">
          <select id="cat-icon" className={inputClasses} {...register("icon")}>
            {ICON_OPTIONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sort order" htmlFor="cat-sort">
          <input
            id="cat-sort"
            type="number"
            min={0}
            className={inputClasses}
            {...register("sortOrder", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-5">
        <SubmitButton pending={isSubmitting}>
          {category ? "Save category" : "Create category"}
        </SubmitButton>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="text-sm font-medium text-ink-muted hover:text-pine"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
