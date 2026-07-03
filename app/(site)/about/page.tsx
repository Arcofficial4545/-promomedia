import type { Metadata } from "next";
import { BadgeCheck, Newspaper, RefreshCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageHeader } from "@/components/marketing/PageHeader";

export const metadata: Metadata = {
  title: "About Promopedia",
  description:
    "Who we are, how we verify deals, and why Promopedia exists: sharp editorial coverage of AI tools and SaaS with codes that actually work.",
  alternates: { canonical: "/about" },
};

const principles = [
  {
    icon: BadgeCheck,
    title: "Every code gets tested",
    body: "A deal doesn't ship until an editor has confirmed it applies at checkout. When a code dies, we pull it — an expired coupon costs you trust and us readers.",
  },
  {
    icon: Newspaper,
    title: "Editorial first",
    body: "We write reviews and comparisons the way we'd want to read them: opinionated, specific, and honest about trade-offs. Deals support the coverage, never the other way round.",
  },
  {
    icon: RefreshCcw,
    title: "Updated daily",
    body: "Offers rotate constantly in SaaS. Our feed is refreshed every day, and expiry dates are shown on every ticket so you never plan around a dead deal.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="Deals for people who read the fine print"
        description="Promopedia covers AI tools, SaaS products, and digital services — and pairs that coverage with verified codes so you never pay list price for software again."
      />
      <Section>
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {principles.map((principle) => (
              <Card key={principle.title} className="p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-mint text-pine">
                  <principle.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold text-ink">
                  {principle.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {principle.body}
                </p>
              </Card>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-2xl space-y-5 text-body-lg leading-relaxed text-ink-muted">
            <p>
              Promopedia started with a simple irritation: software buyers
              routinely pay 20 to 30 percent more than they need to, because
              working discounts are scattered across newsletters, partner
              pages, and expired listicles. We fix that by doing the tedious
              part — finding, testing, and re-testing offers — and publishing
              only what works.
            </p>
            <p>
              The editorial side exists because a discount is only useful if
              the product is worth buying. Our reviews and comparisons are
              written by people who use these tools daily, and no store can
              pay for coverage or a rating.
            </p>
            <p>
              Some outbound links earn us a commission at no cost to you;
              that&apos;s the business model, disclosed in full on our
              disclosure page. It has never changed a verdict, and it never
              will.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
