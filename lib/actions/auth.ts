"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/adapters/auth";
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";
import { clientKeyFromHeaders, rateLimit } from "@/lib/rateLimit";

const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(200),
});

export type LoginResult = { ok: false; message: string };

export async function login(
  _prev: LoginResult | null,
  formData: FormData,
): Promise<LoginResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email and password." };
  }

  const h = await headers();
  if (!rateLimit(`login:${clientKeyFromHeaders(h)}`, { limit: 10, windowMs: 900_000 }).ok) {
    return { ok: false, message: "Too many attempts. Try again in 15 minutes." };
  }

  const user = await auth.verifyCredentials(
    parsed.data.email,
    parsed.data.password,
  );
  if (!user) {
    return { ok: false, message: "Wrong email or password." };
  }

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });

  const from = formData.get("from");
  redirect(
    typeof from === "string" && from.startsWith("/admin") ? from : "/admin",
  );
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
