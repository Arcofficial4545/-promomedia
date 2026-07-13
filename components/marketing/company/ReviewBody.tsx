import { Check, Minus } from "lucide-react";

type ReviewBodyProps = {
  brandName: string;
  heroSummary: string;
  goodPoints: string[];
  weakPoints: string[];
};

export function ReviewBody({
  brandName,
  heroSummary,
  goodPoints,
  weakPoints,
}: ReviewBodyProps) {
  return (
    <div>
      <h3 className="text-h4 font-bold text-pine">
        What {brandName} actually is
      </h3>
      <p className="mt-3 max-w-3xl leading-relaxed text-ink-muted">
        {heroSummary}
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Good points */}
        <div>
          <h4 className="text-sm font-semibold tracking-wide text-success uppercase">
            What&apos;s good
          </h4>
          <ul className="mt-3 space-y-3">
            {goodPoints.map((point, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-muted">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-success"
                  aria-hidden="true"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weak points */}
        <div>
          <h4 className="text-sm font-semibold tracking-wide text-warning uppercase">
            What&apos;s not
          </h4>
          <ul className="mt-3 space-y-3">
            {weakPoints.map((point, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-muted">
                <Minus
                  className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                  aria-hidden="true"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
