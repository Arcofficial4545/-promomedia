"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { AdminActionResult } from "@/lib/actions/admin/shared";

type DeleteButtonProps = {
  /** Server action performing the delete. */
  action: () => Promise<AdminActionResult>;
  /** What's being deleted, for the confirm copy. */
  label: string;
  redirectTo?: string;
};

/** Destructive action with inline two-step confirm. */
export function DeleteButton({ action, label, redirectTo }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-btn)] border border-line px-3 text-sm font-medium text-danger transition-colors hover:border-danger"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
        Delete
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <span className="text-sm text-ink-muted">Delete {label}?</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await action();
            toast(result.message);
            if (result.ok) {
              if (redirectTo) router.push(redirectTo);
              else router.refresh();
            }
            setConfirming(false);
          })
        }
        className="inline-flex h-9 items-center rounded-[var(--radius-btn)] bg-danger px-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Deleting" : "Yes, delete"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-sm font-medium text-ink-muted hover:text-pine"
      >
        Cancel
      </button>
    </span>
  );
}
