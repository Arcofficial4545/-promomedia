"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { submitContactMessage } from "@/lib/actions/public";
import { contactSchema, type ContactInput } from "@/lib/validators/public";
import { Input, Textarea } from "@/components/ui/Input";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "", website: "" },
  });

  async function onSubmit(data: ContactInput) {
    const result = await submitContactMessage(data);
    if (result.ok) {
      setSent(true);
    } else {
      toast(result.message);
    }
  }

  if (sent) {
    return (
      <div
        className="flex items-start gap-3 rounded-[var(--radius-card)] border border-mint-200 bg-mint p-6"
        role="status"
      >
        <Check className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
        <div>
          <p className="font-semibold text-pine">Message received</p>
          <p className="mt-1 text-sm text-ink-muted">
            Thanks for writing in. We read every message and reply within two
            business days.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-ink">
            Name
          </label>
          <Input
            id="contact-name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1.5 text-xs text-danger" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-danger" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink">
          Message
        </label>
        <Textarea
          id="contact-message"
          rows={6}
          aria-invalid={!!errors.message}
          {...register("message")}
        />
        {errors.message && (
          <p className="mt-1.5 text-xs text-danger" role="alert">
            {errors.message.message}
          </p>
        )}
      </div>

      {/* Honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        {...register("website")}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-gloss btn-pine press-down inline-flex h-11 items-center gap-2 rounded-[var(--radius-btn)] px-6 text-sm font-semibold disabled:opacity-60"
      >
        {isSubmitting ? "Sending" : "Send message"}
        <Send className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
