"use client";

import { cn } from "@/lib/utils";

/** Dense form-field primitives for the admin portal. */

export function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-ink"
      >
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-subtle">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClasses =
  "h-10 w-full rounded-[var(--radius-input)] border border-line-strong bg-white px-3 text-sm text-ink placeholder:text-ink-subtle focus:border-emerald focus:shadow-[0_0_0_3px_rgba(30,198,119,0.25)] focus:outline-none disabled:bg-mint disabled:opacity-60";

export const textareaClasses =
  "min-h-24 w-full rounded-[var(--radius-input)] border border-line-strong bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-subtle focus:border-emerald focus:shadow-[0_0_0_3px_rgba(30,198,119,0.25)] focus:outline-none";

export const selectClasses =
  "h-10 w-full rounded-[var(--radius-input)] border border-line-strong bg-white px-3 text-sm text-ink focus:border-emerald focus:shadow-[0_0_0_3px_rgba(30,198,119,0.25)] focus:outline-none";

export function CheckboxField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-ink">
      <input type="checkbox" className={cn("h-4 w-4 accent-[#1ec677]")} {...props} />
      {label}
    </label>
  );
}

export function SubmitButton({
  pending,
  children = "Save",
}: {
  pending: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-gloss btn-pine press-down inline-flex h-10 items-center gap-2 rounded-[var(--radius-btn)] px-5 text-sm font-semibold disabled:opacity-60"
    >
      {pending ? "Saving" : children}
    </button>
  );
}
