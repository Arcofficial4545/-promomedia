"use server";

import { headers } from "next/headers";
import { createContactMessage } from "@/lib/db/repositories/contact";
import { subscribeEmail } from "@/lib/db/repositories/newsletter";
import { clientKeyFromHeaders, rateLimit } from "@/lib/rateLimit";
import { contactSchema, newsletterSchema } from "@/lib/validators/public";

export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function subscribeToNewsletter(
  input: unknown,
): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid email.",
    };
  }

  const h = await headers();
  if (!rateLimit(`newsletter:${clientKeyFromHeaders(h)}`, { limit: 5, windowMs: 3_600_000 }).ok) {
    return { ok: false, message: "Too many attempts. Try again later." };
  }

  const { already } = await subscribeEmail(parsed.data.email, parsed.data.source);
  return {
    ok: true,
    message: already
      ? "You're already subscribed."
      : "You're on the list. Watch your inbox.",
  };
}

export async function submitContactMessage(
  input: unknown,
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Check the form and try again.",
    };
  }

  const h = await headers();
  if (!rateLimit(`contact:${clientKeyFromHeaders(h)}`, { limit: 3, windowMs: 3_600_000 }).ok) {
    return { ok: false, message: "Too many messages. Try again later." };
  }

  await createContactMessage({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  });

  return { ok: true, message: "Thanks — we read every message and reply within two business days." };
}
