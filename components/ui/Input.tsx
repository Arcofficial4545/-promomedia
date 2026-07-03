import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[var(--radius-input)] border border-line-strong bg-white px-3.5 text-body text-ink placeholder:text-ink-subtle",
        "transition-[border-color,box-shadow] duration-150",
        "focus:border-emerald focus:shadow-[0_0_0_3px_rgba(30,198,119,0.25)] focus:outline-none",
        "disabled:cursor-not-allowed disabled:bg-mint disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-[var(--radius-input)] border border-line-strong bg-white px-3.5 py-2.5 text-body text-ink placeholder:text-ink-subtle",
        "transition-[border-color,box-shadow] duration-150",
        "focus:border-emerald focus:shadow-[0_0_0_3px_rgba(30,198,119,0.25)] focus:outline-none",
        "disabled:cursor-not-allowed disabled:bg-mint disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}
