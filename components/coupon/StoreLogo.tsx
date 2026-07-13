import Image from "next/image";
import { cn } from "@/lib/utils";

type StoreLogoProps = {
  name: string;
  logoUrl: string | null;
  /** Brand theme-color — tints the letter-tile fallback when no logo exists. */
  themeColor?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { box: "h-9 w-9 rounded-lg text-sm", px: 36 },
  md: { box: "h-12 w-12 rounded-xl text-lg", px: 48 },
  lg: { box: "h-16 w-16 rounded-2xl text-2xl", px: 64 },
} as const;

/** Relative luminance of a #rrggbb/#rgb color, for picking readable text. */
function isLight(hex: string): boolean {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h.split("").map((c) => c + c).join("")
      : h.slice(0, 6);
  if (full.length < 6) return false;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return false;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

/** Brand logo, or a theme-tinted initial tile when no logo file exists. */
export function StoreLogo({
  name,
  logoUrl,
  themeColor,
  size = "md",
  className,
}: StoreLogoProps) {
  const s = sizeMap[size];

  if (logoUrl) {
    // Local SVG logos skip Next's optimizer (which blocks SVG by default);
    // safe because these files are ours, not user content. Padded tile keeps
    // original logo colors and aspect ratio.
    const lower = logoUrl.toLowerCase();
    const isSvg = lower.endsWith(".svg") || lower.endsWith(".ico");
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden",
          s.box,
          className,
        )}
      >
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          width={s.px}
          height={s.px}
          unoptimized={isSvg}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  const tint =
    themeColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(themeColor.trim())
      ? themeColor.trim()
      : null;

  return (
    <span
      aria-hidden="true"
      style={tint ? { backgroundColor: tint } : undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-display font-bold select-none",
        !tint && "bg-pine text-white",
        tint && (isLight(tint) ? "text-pine" : "text-white"),
        s.box,
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
