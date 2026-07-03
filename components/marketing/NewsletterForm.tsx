"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { subscribeToNewsletter } from "@/lib/actions/public";
import { cn } from "@/lib/utils";

type NewsletterFormProps = {
  source: string;
  className?: string;
  /** Visual context: "dark" for pine sections, "light" for white/mint. */
  tone?: "dark" | "light";
};

type FormState = "idle" | "submitting" | "success" | "error";

export function NewsletterForm({
  source,
  className,
  tone = "dark",
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    const result = await subscribeToNewsletter({ email, source, company: "" });
    setMessage(result.message);
    setState(result.ok ? "success" : "error");
  }

  if (state === "success") {
    return (
      <p
        className={cn(
          "flex items-center gap-2 text-sm font-medium text-emerald",
          className,
        )}
        role="status"
      >
        <Check className="h-4 w-4" aria-hidden="true" />
        {message}
      </p>
    );
  }

  const inputClasses =
    tone === "dark"
      ? "border-white/20 bg-white/10 text-white placeholder:text-white/50"
      : "border-line-strong bg-white text-ink placeholder:text-ink-subtle";

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)} noValidate>
      <div className="flex w-full max-w-sm items-center gap-2">
        <label htmlFor={`newsletter-email-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-email-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") setState("idle");
          }}
          placeholder="you@company.com"
          className={cn(
            "h-11 w-full rounded-[var(--radius-input)] border px-3.5 text-sm focus:border-emerald focus:shadow-[0_0_0_3px_rgba(30,198,119,0.3)] focus:outline-none",
            inputClasses,
          )}
          aria-invalid={state === "error"}
          aria-describedby={
            state === "error" ? `newsletter-error-${source}` : undefined
          }
        />
        {/* Honeypot */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="btn-gloss btn-primary press-down inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[var(--radius-btn)] px-4 text-sm font-semibold disabled:opacity-60"
        >
          Subscribe
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {state === "error" && (
        <p
          id={`newsletter-error-${source}`}
          className={cn(
            "mt-2 text-xs",
            tone === "dark" ? "text-[#f3b6ab]" : "text-danger",
          )}
          role="alert"
        >
          {message}
        </p>
      )}
    </form>
  );
}
