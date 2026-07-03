import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "emerald"
  | "pine"
  | "outline"
  | "verified"
  | "warning"
  | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-mint text-pine border-mint-200",
  emerald: "bg-emerald text-pine-900 border-transparent",
  pine: "bg-pine text-white border-transparent",
  outline: "bg-transparent text-ink-muted border-line-strong",
  verified: "bg-mint text-success border-mint-200",
  warning: "bg-[#fdf6e7] text-warning border-[#f0e3c4]",
  danger: "bg-[#fbeeec] text-danger border-[#f2d5d0]",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
