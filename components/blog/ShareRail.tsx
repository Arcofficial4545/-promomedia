"use client";

import { Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ShareRailProps = {
  title: string;
  url: string;
  className?: string;
};

export function ShareRail({ title, url, className }: ShareRailProps) {
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch {
      toast("Copy failed", { description: url });
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user dismissed
      }
    } else {
      await copyLink();
    }
  }

  const itemClasses =
    "press-down inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-btn)] border border-line text-ink-muted transition-colors hover:border-emerald-600 hover:text-pine";

  return (
    <div className={cn("flex gap-2 lg:flex-col", className)}>
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link to article"
        className={itemClasses}
      >
        <Link2 className="h-4.5 w-4.5" aria-hidden="true" />
      </button>
      <a
        href={`https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={itemClasses}
      >
        <span className="font-display text-sm font-bold" aria-hidden="true">
          X
        </span>
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className={itemClasses}
      >
        <span className="font-display text-sm font-bold" aria-hidden="true">
          in
        </span>
      </a>
      <button
        type="button"
        onClick={nativeShare}
        aria-label="Share"
        className={itemClasses}
      >
        <Share2 className="h-4.5 w-4.5" aria-hidden="true" />
      </button>
    </div>
  );
}
