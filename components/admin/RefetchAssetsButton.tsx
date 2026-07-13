"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  refetchAllStoreAssets,
  refetchStoreAssets,
} from "@/lib/actions/admin/stores";

/** Row action: re-fetch one store's logo/cover/theme-color from its site. */
export function RefetchAssetsButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await refetchStoreAssets(id);
          if (res.ok) toast.success(res.message);
          else toast.error(res.message);
          router.refresh();
        })
      }
      className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-btn)] border border-line px-2.5 text-xs font-medium text-ink transition-colors hover:border-emerald-600 disabled:opacity-50"
    >
      <RefreshCw
        className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {pending ? "Fetching" : "Assets"}
    </button>
  );
}

/** Page header action: bulk re-fetch across every active real store. */
export function RefetchAllAssetsButton() {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await refetchAllStoreAssets();
          if (res.ok) toast.success(res.message);
          else toast.error(res.message);
          router.refresh();
        })
      }
      className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-btn)] border border-line px-3 text-sm font-medium text-ink transition-colors hover:border-emerald-600 disabled:opacity-50"
    >
      <RefreshCw
        className={`h-4 w-4 ${pending ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {pending ? "Refetching…" : "Refetch all assets"}
    </button>
  );
}
