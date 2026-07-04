"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { markMessageRead } from "@/lib/actions/admin/messages";

export function MarkReadButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => markMessageRead(id).then(() => undefined))}
      className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-btn)] border border-line px-2.5 text-xs font-medium text-ink transition-colors hover:border-emerald-600 disabled:opacity-60"
    >
      <Check className="h-3.5 w-3.5" aria-hidden="true" />
      Mark read
    </button>
  );
}
