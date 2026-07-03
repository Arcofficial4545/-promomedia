type TrustStripProps = {
  brandNames: string[];
};

/** Thin marquee of brand names + trust claims on solid mint. */
export function TrustStrip({ brandNames }: TrustStripProps) {
  const items = [
    "1,000+ verified deals",
    ...brandNames.slice(0, 6),
    "Updated daily",
    ...brandNames.slice(6, 12),
    "Zero spam",
  ];

  return (
    <section
      aria-label="Brands we cover"
      className="overflow-hidden border-y border-mint-200 bg-mint py-4"
    >
      <div
        className="marquee-track"
        style={{ "--marquee-duration": "48s" } as React.CSSProperties}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
            {items.map((item, i) => (
              <span
                key={`${copy}-${i}`}
                className="mx-7 font-mono text-sm font-medium tracking-wider whitespace-nowrap text-ink-muted uppercase"
              >
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
