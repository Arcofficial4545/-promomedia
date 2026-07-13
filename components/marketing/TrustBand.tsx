import Link from "next/link";
import { BadgeCheck, BookOpen, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";

const trustPoints = [
  {
    icon: BookOpen,
    text: "Research-based editorial reviews",
  },
  {
    icon: BadgeCheck,
    text: "Every offer verified by a human",
  },
  {
    icon: ShieldCheck,
    text: "Independent — never influenced by brands",
  },
];

export function TrustBand() {
  return (
    <section className="border-y border-mint-200 bg-mint py-5">
      <Container size="wide">
        <Link
          href="/how-we-review"
          className="group flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8"
        >
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <span
                key={point.text}
                className="inline-flex items-center gap-2 text-sm font-medium text-pine transition-colors group-hover:text-emerald-700"
              >
                <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
                {point.text}
              </span>
            );
          })}
        </Link>
      </Container>
    </section>
  );
}
