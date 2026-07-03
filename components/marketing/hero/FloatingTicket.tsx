"use client";

import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type FloatingTicketData = {
  storeName: string;
  discountLabel: string;
  isVerified: boolean;
};

type FloatingTicketProps = {
  ticket: FloatingTicketData;
  tone?: "white" | "mint";
  className?: string;
  /** Idle float timing offset so tickets don't bob in sync. */
  floatDuration?: string;
  rotate?: string;
};

/**
 * Decorative mini coupon ticket for the hero — solid fill, perforation,
 * mask notches. Non-interactive (aria-hidden; the real deals are below).
 */
export function FloatingTicket({
  ticket,
  tone = "white",
  className,
  floatDuration = "7s",
  rotate = "0deg",
}: FloatingTicketProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("idle-float pointer-events-none select-none", className)}
      style={
        {
          "--float-duration": floatDuration,
          "--float-rotate": rotate,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "ticket-shape flex w-56 rounded-xl shadow-lg",
          tone === "mint" ? "bg-mint" : "bg-white",
        )}
        style={{ "--ticket-stub": "4.25rem", "--ticket-notch": "8px" } as React.CSSProperties}
      >
        <div className="min-w-0 flex-1 p-3.5">
          <p className="truncate text-xs font-semibold text-ink-muted">
            {ticket.storeName}
          </p>
          <p className="mt-1 font-mono text-lg font-bold tracking-tight text-pine">
            {ticket.discountLabel}
          </p>
          {ticket.isVerified && (
            <p className="mt-1 inline-flex items-center gap-1 text-[0.65rem] font-medium text-success">
              <BadgeCheck className="h-3 w-3" />
              Verified
            </p>
          )}
        </div>
        <div className="ticket-perforation flex w-[4.25rem] items-center justify-center">
          <span className="rotate-90 font-mono text-[0.6rem] font-bold tracking-[0.2em] text-ink-subtle uppercase">
            Deal
          </span>
        </div>
      </div>
    </div>
  );
}
