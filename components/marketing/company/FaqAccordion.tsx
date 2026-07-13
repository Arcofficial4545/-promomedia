"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/db/schema";

type FaqSectionProps = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        const id = `faq-answer-${i}`;
        return (
          <div key={i}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={id}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-ink transition-colors hover:bg-mint/50"
            >
              <span>{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-ink-subtle transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
            <div
              id={id}
              hidden={!isOpen}
              role="region"
              className="px-5 pb-4 text-sm leading-relaxed text-ink-muted"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
