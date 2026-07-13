import { Fragment } from "react";
import { Check } from "lucide-react";
import { StoreLogo } from "@/components/coupon/StoreLogo";
import { cn } from "@/lib/utils";
import type { ComparisonWithStores } from "@/lib/db/repositories/comparisons";

/**
 * The signature head-to-head table (Section 9.3). Semantic `<table>` with
 * `scope`d headers; the winning cell gets a mint tint + emerald Check, a `tie`
 * is left plain. Scrolls horizontally with a sticky first column on mobile.
 */
export function ComparisonTable({
  comparison: c,
}: {
  comparison: ComparisonWithStores;
}) {
  const { storeA, storeB, criteria } = c;

  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">{c.title} feature comparison</caption>
        <thead>
          <tr className="border-b border-line">
            <th
              scope="col"
              className="sticky left-0 z-10 bg-white px-4 py-4 text-left font-mono text-xs font-semibold tracking-wider text-ink-subtle uppercase"
            >
              Criterion
            </th>
            <ColHead store={storeA} />
            <ColHead store={storeB} />
          </tr>
        </thead>
        <tbody>
          {criteria.map((row, i) => (
            <Fragment key={i}>
              <tr className="border-b border-line/60">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white px-4 py-4 text-left align-top font-medium text-ink"
                >
                  {row.label}
                </th>
                <Cell text={row.aText} win={row.winner === "a"} />
                <Cell text={row.bText} win={row.winner === "b"} />
              </tr>
              {row.note && (
                <tr className="border-b border-line/60">
                  <td
                    colSpan={3}
                    className="bg-mint/20 px-4 py-2 text-xs leading-relaxed text-ink-subtle"
                  >
                    {row.note}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ColHead({ store }: { store: ComparisonWithStores["storeA"] }) {
  return (
    <th scope="col" className="bg-white px-4 py-4 text-left">
      <div className="flex items-center gap-2.5">
        <StoreLogo
          name={store.name}
          logoUrl={store.logoUrl}
          themeColor={store.themeColor}
          size="sm"
        />
        <div className="min-w-0">
          <span className="block truncate font-display font-semibold text-ink">
            {store.name}
          </span>
          {store.editorialScore !== null && (
            <span className="font-mono text-xs text-ink-subtle">
              {store.editorialScore.toFixed(1)} / 10
            </span>
          )}
        </div>
      </div>
    </th>
  );
}

function Cell({ text, win }: { text: string; win: boolean }) {
  return (
    <td
      className={cn(
        "px-4 py-4 align-top leading-relaxed text-ink-muted",
        win && "bg-mint",
      )}
    >
      <span className="flex gap-2">
        {win && (
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
            aria-label="Winner"
          />
        )}
        <span>{text}</span>
      </span>
    </td>
  );
}
