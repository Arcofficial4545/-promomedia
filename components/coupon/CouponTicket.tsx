"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { registerReveal } from "@/lib/actions/tracking";
import { cn, formatNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { StoreLogo } from "./StoreLogo";

export type TicketCoupon = {
  id: string;
  title: string;
  code: string | null;
  type: "code" | "deal";
  discountLabel: string;
  terms: string;
  expiresAt: Date | null;
  isVerified: boolean;
  isExclusive: boolean;
  clickCount: number;
  revealCount: number;
  successReports: number;
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
};

type CouponTicketProps = {
  coupon: TicketCoupon;
  tone?: "white" | "mint";
  /** Hide the store identity row (on the store's own page). */
  hideStore?: boolean;
  className?: string;
};

function maskCode(code: string): string {
  if (code.length <= 4) return `${code.charAt(0)}${"•".repeat(3)}`;
  return `${code.slice(0, 2)}${"•".repeat(4)}${code.slice(-2)}`;
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function CouponTicket({
  coupon,
  tone = "white",
  hideStore = false,
  className,
}: CouponTicketProps) {
  const [revealed, setRevealed] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  // Snapshot once per mount: expiry state must be stable across re-renders.
  const [mountedAt] = useState(() => Date.now());
  const termsId = useId();

  const expired =
    coupon.expiresAt !== null && coupon.expiresAt.getTime() <= mountedAt;
  const expiresIn = coupon.expiresAt
    ? Math.ceil((coupon.expiresAt.getTime() - mountedAt) / 86_400_000)
    : null;
  const goHref = `/go/${coupon.id}`;

  const successRate =
    coupon.revealCount > 0
      ? Math.round(
          Math.min(1, coupon.successReports / coupon.revealCount) * 100,
        )
      : null;
  const usedTimes = coupon.clickCount;

  async function handleReveal() {
    if (expired) return;
    setRevealed(true);
    if (coupon.code) {
      const ok = await copyToClipboard(coupon.code);
      toast(ok ? "Code copied" : `Code: ${coupon.code}`, {
        description: ok
          ? `${coupon.code} — paste it at ${coupon.store.name} checkout.`
          : "Copy it manually from the ticket.",
      });
    }
    void registerReveal(coupon.id);
  }

  async function handleCopyAgain() {
    if (!coupon.code) return;
    const ok = await copyToClipboard(coupon.code);
    toast(ok ? "Code copied" : "Copy failed", {
      description: ok ? coupon.code : "Select and copy the code manually.",
    });
  }

  return (
    <article
      className={cn(
        "ticket-shape relative flex rounded-[var(--radius-card)] border shadow-sm transition-shadow duration-200",
        tone === "mint" ? "border-mint-200 bg-mint" : "border-line bg-white",
        expired ? "opacity-60" : "hover:shadow-md",
        className,
      )}
      aria-label={`${coupon.store.name}: ${coupon.title}`}
    >
      {/* ------------------------------------------------ Main body */}
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        {!hideStore && (
          <div className="mb-3 flex items-center gap-2.5">
            <StoreLogo
              name={coupon.store.name}
              logoUrl={coupon.store.logoUrl}
              size="sm"
            />
            <Link
              href={`/stores/${coupon.store.slug}`}
              className="truncate text-sm font-semibold text-pine hover:underline"
            >
              {coupon.store.name}
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xl font-bold tracking-tight text-pine sm:text-2xl">
            {coupon.discountLabel}
          </span>
          {coupon.isVerified && !expired && (
            <Badge variant="verified">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Verified
            </Badge>
          )}
          {coupon.isExclusive && !expired && (
            <Badge variant="emerald">
              <Star className="h-3 w-3" aria-hidden="true" />
              Exclusive
            </Badge>
          )}
          {expired && <Badge variant="danger">Expired</Badge>}
        </div>

        <h3 className="mt-1.5 text-sm leading-snug font-medium text-ink sm:text-base">
          {coupon.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-subtle">
          {coupon.expiresAt &&
            (expired ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Expired
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                Expires in {expiresIn}d
              </span>
            ))}
          {usedTimes > 0 && <span>Used {formatNumber(usedTimes)} times</span>}
          {successRate !== null && successRate > 0 && (
            <span>{successRate}% success</span>
          )}
          {coupon.terms && (
            <button
              type="button"
              onClick={() => setTermsOpen((open) => !open)}
              aria-expanded={termsOpen}
              aria-controls={termsId}
              className="inline-flex items-center gap-0.5 font-medium text-ink-muted hover:text-pine"
            >
              Terms
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  termsOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        {coupon.terms && (
          <div
            id={termsId}
            hidden={!termsOpen}
            className="mt-2 rounded-lg bg-black/[0.03] px-3 py-2 text-xs leading-relaxed text-ink-muted"
          >
            {coupon.terms}
          </div>
        )}
      </div>

      {/* ------------------------------------------------ Stub */}
      <div className="ticket-perforation flex w-[8.25rem] shrink-0 flex-col items-center justify-center gap-2 p-3 text-center sm:w-[11rem] sm:p-4">
        {expired ? (
          <span className="font-mono text-sm tracking-widest text-ink-subtle uppercase select-none">
            Expired
          </span>
        ) : coupon.type === "code" && coupon.code ? (
          revealed ? (
            <>
              <span
                className="rounded-lg border-2 border-dashed border-emerald-600 bg-mint px-2.5 py-2 font-mono text-sm font-bold tracking-[0.15em] text-pine uppercase sm:text-base"
                aria-label={`Coupon code ${coupon.code}`}
              >
                {coupon.code}
              </span>
              <button
                type="button"
                onClick={handleCopyAgain}
                className="press-down inline-flex items-center gap-1 text-xs font-medium text-pine hover:text-emerald-600"
              >
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                Copy code
              </button>
            </>
          ) : (
            <a
              href={goHref}
              target="_blank"
              rel="sponsored noopener"
              onClick={handleReveal}
              aria-label={`Reveal code for ${coupon.title} and open ${coupon.store.name}`}
              className="group flex flex-col items-center gap-2"
            >
              <span className="rounded-lg border-2 border-dashed border-line-strong bg-white px-2.5 py-2 font-mono text-sm tracking-[0.15em] text-ink-subtle uppercase transition-colors group-hover:border-emerald-600 sm:text-base">
                {maskCode(coupon.code)}
              </span>
              <span className="btn-gloss btn-primary press-down inline-flex h-9 items-center rounded-[var(--radius-btn)] px-3.5 text-xs font-semibold sm:h-10 sm:px-4 sm:text-sm">
                Get Code
              </span>
            </a>
          )
        ) : (
          <a
            href={goHref}
            target="_blank"
            rel="sponsored noopener"
            onClick={handleReveal}
            aria-label={`Get this deal at ${coupon.store.name}`}
            className="btn-gloss btn-primary press-down inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-btn)] px-4 text-xs font-semibold sm:text-sm"
          >
            Get Deal
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
