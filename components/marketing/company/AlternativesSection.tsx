import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StoreLogo } from "@/components/coupon/StoreLogo";
import type { StoreWithMeta } from "@/lib/db/repositories/stores";

type AlternativesSectionProps = {
  alternatives: StoreWithMeta[];
  brandName: string;
};

export function AlternativesSection({
  alternatives,
  brandName,
}: AlternativesSectionProps) {
  if (alternatives.length === 0) return null;

  return (
    <div>
      <h3 className="text-h4 font-bold text-pine">
        Alternatives to {brandName}
      </h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {alternatives.map((store) => (
          <Card key={store.id} interactive className="relative p-5">
            <div className="flex items-center gap-3">
              <StoreLogo
                name={store.name}
                logoUrl={store.logoUrl}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-display text-base font-semibold text-ink">
                  <Link
                    href={`/tools/${store.slug}`}
                    className="after:absolute after:inset-0"
                  >
                    {store.name}
                  </Link>
                </h4>
                <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">
                  {store.tagline}
                </p>
              </div>
              {store.editorialScore !== null && (
                <Badge variant="pine" className="font-mono shrink-0">
                  {store.editorialScore.toFixed(1)}
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
