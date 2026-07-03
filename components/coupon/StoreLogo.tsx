import Image from "next/image";
import { cn } from "@/lib/utils";

type StoreLogoProps = {
  name: string;
  logoUrl: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { box: "h-9 w-9 rounded-lg text-sm", px: 36 },
  md: { box: "h-12 w-12 rounded-xl text-lg", px: 48 },
  lg: { box: "h-16 w-16 rounded-2xl text-2xl", px: 64 },
} as const;

/** Brand logo, or a solid pine initial tile when no logo is uploaded. */
export function StoreLogo({ name, logoUrl, size = "md", className }: StoreLogoProps) {
  const s = sizeMap[size];

  if (logoUrl) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden border border-line bg-white",
          s.box,
          className,
        )}
      >
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          width={s.px}
          height={s.px}
          className="h-full w-full object-contain"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center bg-pine font-display font-bold text-white select-none",
        s.box,
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
