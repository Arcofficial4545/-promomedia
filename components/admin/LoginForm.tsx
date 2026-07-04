"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { login, type LoginResult } from "@/lib/actions/auth";
import { Input } from "@/components/ui/Input";

export function LoginForm({ from }: { from?: string }) {
  const [state, formAction, pending] = useActionState<LoginResult | null, FormData>(
    login,
    null,
  );

  return (
    <form action={formAction} className="space-y-5">
      {from && <input type="hidden" name="from" value={from} />}
      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          autoComplete="username"
          required
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-ink">
          Password
        </label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state && !state.ok && (
        <p className="text-sm text-danger" role="alert">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn-gloss btn-pine press-down inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-btn)] text-sm font-semibold disabled:opacity-60"
      >
        {pending ? "Signing in" : "Sign in"}
        <LogIn className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}
