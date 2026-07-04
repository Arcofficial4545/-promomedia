import Link from "next/link";
import { Plus } from "lucide-react";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
  children?: React.ReactNode;
};

export function AdminPageHeader({
  title,
  description,
  createHref,
  createLabel = "New",
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-pine">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-ink-muted">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {createHref && (
          <Link
            href={createHref}
            className="btn-gloss btn-pine press-down inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-btn)] px-4 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {createLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
