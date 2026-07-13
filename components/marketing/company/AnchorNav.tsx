import { cn } from "@/lib/utils";

type AnchorItem = { id: string; label: string };

export function AnchorNav({
  items,
  className,
}: {
  items: AnchorItem[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Page sections"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm",
        className,
      )}
    >
      {items.map((item, i) => (
        <span key={item.id} className="inline-flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-ink-subtle/40" aria-hidden="true">
              ·
            </span>
          )}
          <a
            href={`#${item.id}`}
            className="font-medium text-ink-muted transition-colors hover:text-pine"
          >
            {item.label}
          </a>
        </span>
      ))}
    </nav>
  );
}
