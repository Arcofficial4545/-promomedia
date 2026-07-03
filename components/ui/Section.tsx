import { cn } from "@/lib/utils";

type SectionProps = React.HTMLAttributes<HTMLElement> & {
  tone?: "white" | "mint" | "pine" | "pine-deep";
  padding?: "default" | "tight" | "loose" | "none";
};

const toneClasses = {
  white: "bg-white text-ink",
  mint: "bg-mint text-ink",
  pine: "bg-pine text-white",
  "pine-deep": "bg-pine-900 text-white",
} as const;

const paddingClasses = {
  none: "",
  tight: "py-10 sm:py-14",
  default: "py-16 sm:py-24",
  loose: "py-24 sm:py-32",
} as const;

export function Section({
  tone = "white",
  padding = "default",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(toneClasses[tone], paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </section>
  );
}
