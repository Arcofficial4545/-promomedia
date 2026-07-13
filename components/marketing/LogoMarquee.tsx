import Image from "next/image";
import { Container } from "@/components/ui/Container";

export type LogoMarqueeItem = { name: string; logoUrl: string | null };

/**
 * Seamless logo marquee (Section 6). Each mark sits on a white rounded tile
 * with a hairline border; opacity lifts on hover, the whole track pauses on
 * hover, and it holds a static row under `prefers-reduced-motion` (both via the
 * shared `.marquee-track` rules in globals.css). Alt text is the brand name.
 */
export function LogoMarquee({
  logos,
  caption = "TOOLS WE'VE TESTED",
}: {
  logos: LogoMarqueeItem[];
  caption?: string;
}) {
  const items = logos.filter(
    (l): l is { name: string; logoUrl: string } => !!l.logoUrl,
  );
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Tools we've tested"
      className="overflow-hidden border-y border-line bg-white py-8"
    >
      <Container size="wide">
        <p className="mb-6 font-mono text-xs tracking-[0.2em] text-ink-subtle uppercase">
          {caption}
        </p>
      </Container>
      <div
        className="marquee-track"
        style={{ "--marquee-duration": "50s" } as React.CSSProperties}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="flex shrink-0 items-center"
            aria-hidden={copy === 1}
          >
            {items.map((logo, i) => (
              <span
                key={`${copy}-${i}`}
                className="mx-4 inline-flex h-14 w-16 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
              >
                <Image
                  src={logo.logoUrl}
                  alt={logo.name}
                  width={44}
                  height={26}
                  unoptimized={/\.(svg|ico)$/i.test(logo.logoUrl)}
                  className="max-h-[26px] w-auto object-contain"
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
