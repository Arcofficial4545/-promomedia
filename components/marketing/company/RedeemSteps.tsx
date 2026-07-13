import type { RedeemStep } from "@/lib/db/schema";

type RedeemStepsProps = {
  steps: RedeemStep[];
};

export function RedeemSteps({ steps }: RedeemStepsProps) {
  return (
    <div>
      <ol className="space-y-4">
        {steps.map((step) => (
          <li key={step.step} className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint font-mono text-lg font-bold text-pine">
              {step.step}
            </span>
            <p className="flex-1 pt-2 text-sm leading-relaxed text-ink-muted">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
