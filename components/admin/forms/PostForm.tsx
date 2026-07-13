"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { savePost } from "@/lib/actions/admin/posts";
import type { PostWithMeta } from "@/lib/db/repositories/posts";
import type { TiptapDoc } from "@/lib/db/schema";
import {
  CheckboxField,
  Field,
  inputClasses,
  selectClasses,
  SubmitButton,
  textareaClasses,
} from "@/components/admin/fields";
import type { EditorCouponOption } from "@/components/admin/editor/extensions";
import { TiptapEditor } from "@/components/admin/editor/TiptapEditor";
import { LogoUploadField } from "@/components/admin/forms/LogoUploadField";
import { OgPreview } from "@/components/admin/forms/OgPreview";
import { slugifyClient, toDatetimeLocal } from "./utils";

type Option = { id: string; name: string };

type FormValues = {
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  authorId: string;
  categoryId: string;
  tags: string; // comma separated in the form
  status: "draft" | "published";
  publishedAt: string;
  readingMinutes: number;
  seoTitle: string;
  seoDescription: string;
  relatedStoreIds: string[];
};

const EMPTY_DOC: TiptapDoc = { type: "doc", content: [{ type: "paragraph" }] };

export function PostForm({
  post,
  relatedStoreIds,
  authors,
  categories,
  stores,
  couponOptions,
}: {
  post: PostWithMeta | null;
  relatedStoreIds: string[];
  authors: Option[];
  categories: Option[];
  stores: Option[];
  couponOptions: EditorCouponOption[];
}) {
  const router = useRouter();
  const [contentJson, setContentJson] = useState<TiptapDoc>(
    post?.contentJson ?? EMPTY_DOC,
  );
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, dirtyFields },
  } = useForm<FormValues>({
    defaultValues: {
      title: post?.title ?? "",
      slug: post?.slug ?? "",
      excerpt: post?.excerpt ?? "",
      coverImageUrl: post?.coverImageUrl ?? "",
      authorId: post?.authorId ?? authors[0]?.id ?? "",
      categoryId: post?.categoryId ?? "",
      tags: post?.tags.join(", ") ?? "",
      status: post?.status ?? "draft",
      publishedAt: toDatetimeLocal(post?.publishedAt),
      readingMinutes: post?.readingMinutes ?? 3,
      seoTitle: post?.seoTitle ?? "",
      seoDescription: post?.seoDescription ?? "",
      relatedStoreIds,
    },
  });

  async function onSubmit(values: FormValues) {
    const result = await savePost(post?.id ?? null, {
      ...values,
      contentJson,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
    toast(result.message);
    if (result.ok) router.push("/admin/blog");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_20rem]">
        {/* ------------------------------------------- Main column */}
        <div className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6">
          <Field label="Title" htmlFor="post-title">
            <input
              id="post-title"
              className={inputClasses}
              {...register("title", {
                onChange: (e) => {
                  if (!post && !dirtyFields.slug) {
                    setValue("slug", slugifyClient(e.target.value));
                  }
                },
              })}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Slug" htmlFor="post-slug">
              <input id="post-slug" className={inputClasses} {...register("slug")} />
            </Field>
            <Field label="Tags" htmlFor="post-tags" hint="Comma separated.">
              <input id="post-tags" className={inputClasses} {...register("tags")} />
            </Field>
          </div>

          <Field label="Excerpt" htmlFor="post-excerpt">
            <textarea
              id="post-excerpt"
              rows={2}
              className={textareaClasses}
              {...register("excerpt")}
            />
          </Field>

          <Field
            label="Content"
            hint="Use the toolbar to embed live coupon tickets and promo slots."
          >
            <TiptapEditor
              value={contentJson}
              coupons={couponOptions}
              onChange={(doc, wordCount) => {
                setContentJson(doc);
                setValue("readingMinutes", Math.max(1, Math.round(wordCount / 200)));
              }}
            />
          </Field>
        </div>

        {/* ------------------------------------------- Side column */}
        <div className="space-y-5">
          <div className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-5">
            <Field label="Status" htmlFor="post-status">
              <select id="post-status" className={selectClasses} {...register("status")}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <Field
              label="Publish date"
              htmlFor="post-published"
              hint="Future date = scheduled. Empty + published = now."
            >
              <input
                id="post-published"
                type="datetime-local"
                className={inputClasses}
                {...register("publishedAt")}
              />
            </Field>
            <Field label="Reading minutes" htmlFor="post-reading" hint="Auto-calculated from content.">
              <input
                id="post-reading"
                type="number"
                min={1}
                className={inputClasses}
                {...register("readingMinutes", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Author" htmlFor="post-author">
              <select id="post-author" className={selectClasses} {...register("authorId")}>
                {authors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Category" htmlFor="post-category">
              <select id="post-category" className={selectClasses} {...register("categoryId")}>
                <option value="">None</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
            <LogoUploadField
              label="Cover image"
              value={watch("coverImageUrl")}
              onChange={(url) => setValue("coverImageUrl", url, { shouldDirty: true })}
            />
          </div>

          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
            <Field label="Related stores" hint="Powers the related-deals rail.">
              <div className="max-h-48 space-y-1.5 overflow-y-auto">
                {stores.map((store) => (
                  <CheckboxField
                    key={store.id}
                    label={store.name}
                    value={store.id}
                    {...register("relatedStoreIds")}
                  />
                ))}
              </div>
            </Field>
          </div>

          <div className="space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-5">
            <Field label="SEO title" htmlFor="post-seo-title">
              <input id="post-seo-title" className={inputClasses} {...register("seoTitle")} />
            </Field>
            <Field label="SEO description" htmlFor="post-seo-desc">
              <textarea
                id="post-seo-desc"
                rows={2}
                className={textareaClasses}
                {...register("seoDescription")}
              />
            </Field>
            <OgPreview
              title={watch("seoTitle") || watch("title")}
              description={watch("seoDescription") || watch("excerpt")}
              slug={watch("slug")}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton pending={isSubmitting}>
          {post ? "Save post" : "Create post"}
        </SubmitButton>
        <button
          type="button"
          onClick={() => router.push("/admin/blog")}
          className="text-sm font-medium text-ink-muted hover:text-pine"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
