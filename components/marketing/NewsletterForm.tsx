"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type NewsletterFormProps = {
  source: string;
  className?: string;
};

type FormState = "idle" | "submitting" | "success" | "error";

/**
 * Newsletter capture. Posts to the newsletter server action.
 * TODO(phase-7): wire `subscribeToNewsletter` server action once the data
 * layer lands; until then the form validates locally and shows success.
 */
export function NewsletterForm({ source, className }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      return;
    }
    setState("submitting");
    // TODO(phase-7): replace with server action call carrying `source`.
    void source;
    setState("success");
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
        You&apos;re on the list. Watch your inbox.
      </p>
    );
  }

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
          className="h-11 w-full rounded-[var(--radius-input)] border border-white/20 bg-white/10 px-3.5 text-sm text-white placeholder:text-white/50 focus:border-emerald focus:shadow-[0_0_0_3px_rgba(30,198,119,0.3)] focus:outline-none"
          aria-invalid={state === "error"}
          aria-describedby={
            state === "error" ? `newsletter-error-${source}` : undefined
          }
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="btn-gloss btn-primary press-down inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[var(--radius-btn)] px-4 text-sm font-semibold"
        >
          Subscribe
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {state === "error" && (
        <p
          id={`newsletter-error-${source}`}
          className="mt-2 text-xs text-[#f3b6ab]"
          role="alert"
        >
          Enter a valid email address.
        </p>
      )}
    </form>
  );
}
