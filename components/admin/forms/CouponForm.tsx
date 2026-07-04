"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { saveCoupon } from "@/lib/actions/admin/coupons";
import type { CouponWithStore } from "@/lib/db/repositories/coupons";
import {
  CheckboxField,
  Field,
  inputClasses,
  selectClasses,
  SubmitButton,
  textareaClasses,
} from "@/components/admin/fields";
import { toDatetimeLocal } from "./utils";

type StoreOption = { id: string; name: string };

type FormValues = {
  storeId: string;
  title: string;
  type: "code" | "deal";
  code: string;
  discountLabel: string;
  discountValue: string;
  terms: string;
  destinationUrl: string;
  startsAt: string;
  expiresAt: string;
  isVerified: boolean;
  isExclusive: boolean;
  isActive: boolean;
  sortWeight: number;
};

export function CouponForm({
  coupon,
  stores,
}: {
  coupon: CouponWithStore | null;
  stores: StoreOption[];
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      storeId: coupon?.storeId ?? "",
      title: coupon?.title ?? "",
      type: coupon?.type ?? "code",
      code: coupon?.code ?? "",
      discountLabel: coupon?.discountLabel ?? "",
      discountValue:
        coupon?.discountValue != null ? String(coupon.discountValue) : "",
      terms: coupon?.terms ?? "",
      destinationUrl: coupon?.destinationUrl ?? "",
      startsAt: toDatetimeLocal(coupon?.startsAt),
      expiresAt: toDatetimeLocal(coupon?.expiresAt),
      isVerified: coupon?.isVerified ?? false,
      isExclusive: coupon?.isExclusive ?? false,
      isActive: coupon?.isActive ?? true,
      sortWeight: coupon?.sortWeight ?? 0,
    },
  });

  const type = watch("type");

  async function onSubmit(values: FormValues) {
    const result = await saveCoupon(coupon?.id ?? null, values);
    toast(result.message);
    if (result.ok) router.push("/admin/coupons");
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl space-y-5 rounded-[var(--radius-card)] border border-line bg-white p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Store" htmlFor="coupon-store">
          <select id="coupon-store" className={selectClasses} {...register("storeId")}>
            <option value="">Pick a store</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type" htmlFor="coupon-type">
          <select id="coupon-type" className={selectClasses} {...register("type")}>
            <option value="code">Code — reveals a coupon code</option>
            <option value="deal">Deal — direct link, no code</option>
          </select>
        </Field>
      </div>

      <Field label="Title" htmlFor="coupon-title" hint='e.g. "30% off your first 3 months of Pro"'>
        <input id="coupon-title" className={inputClasses} {...register("title")} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        {type === "code" && (
          <Field label="Code" htmlFor="coupon-code">
            <input
              id="coupon-code"
              className={`${inputClasses} font-mono uppercase`}
              {...register("code")}
            />
          </Field>
        )}
        <Field label="Discount label" htmlFor="coupon-label" hint='Shown big on the ticket: "30% OFF"'>
          <input id="coupon-label" className={inputClasses} {...register("discountLabel")} />
        </Field>
        <Field label="Discount value" htmlFor="coupon-value" hint="Numeric, for sorting. Optional.">
          <input
            id="coupon-value"
            type="number"
            step="any"
            min={0}
            className={inputClasses}
            {...register("discountValue")}
          />
        </Field>
      </div>

      <Field label="Terms" htmlFor="coupon-terms">
        <textarea id="coupon-terms" rows={3} className={textareaClasses} {...register("terms")} />
      </Field>

      <Field
        label="Destination URL override"
        htmlFor="coupon-destination"
        hint="Optional. Overrides the store's partner URL for this coupon only."
      >
        <input
          id="coupon-destination"
          type="url"
          placeholder="https://..."
          className={inputClasses}
          {...register("destinationUrl")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Starts" htmlFor="coupon-starts">
          <input
            id="coupon-starts"
            type="datetime-local"
            className={inputClasses}
            {...register("startsAt")}
          />
        </Field>
        <Field label="Expires" htmlFor="coupon-expires" hint="Empty = never expires.">
          <input
            id="coupon-expires"
            type="datetime-local"
            className={inputClasses}
            {...register("expiresAt")}
          />
        </Field>
        <Field label="Sort weight" htmlFor="coupon-weight" hint="Higher = shown first.">
          <input
            id="coupon-weight"
            type="number"
            min={0}
            max={1000}
            className={inputClasses}
            {...register("sortWeight", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <CheckboxField label="Verified" {...register("isVerified")} />
        <CheckboxField label="Exclusive" {...register("isExclusive")} />
        <CheckboxField label="Active" {...register("isActive")} />
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-5">
        <SubmitButton pending={isSubmitting}>
          {coupon ? "Save coupon" : "Create coupon"}
        </SubmitButton>
        <button
          type="button"
          onClick={() => router.push("/admin/coupons")}
          className="text-sm font-medium text-ink-muted hover:text-pine"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
