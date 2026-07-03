import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "white" | "mint" | "pine";
  interactive?: boolean;
};

const toneClasses = {
  white: "bg-white border-line",
  mint: "bg-mint border-mint-200",
  pine: "bg-pine border-pine-700 text-white",
} as const;

export function Card({
  tone = "white",
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border shadow-xs",
        toneClasses[tone],
        interactive &&
          "transition-[transform,box-shadow] duration-200 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:shadow-md motion-reduce:hover:translate-y-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
