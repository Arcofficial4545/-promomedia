/**
 * The verdict box (Section 7.4): the skimmer's payoff. Mint surface with a 3px
 * emerald left rule and the bottom-line verdict in body-lg.
 */
export function VerdictBox({ verdict }: { verdict: string }) {
  return (
    <div className="rounded-r-[var(--radius-card)] border-l-[3px] border-emerald bg-mint p-6 sm:p-7">
      <p className="font-mono text-[0.7rem] font-semibold tracking-[0.15em] text-ink-subtle uppercase">
        The verdict
      </p>
      <p className="mt-2 text-body-lg leading-relaxed font-medium text-ink">
        {verdict}
      </p>
    </div>
  );
}
