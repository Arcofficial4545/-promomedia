import { ArrowRight, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { CouponGrid } from "@/components/coupon/CouponGrid";
import { toTicketCoupon } from "@/components/coupon/toTicketCoupon";
import { Reveal } from "@/components/motion/Reveal";
import { listActiveCoupons } from "@/lib/db/repositories/coupons";

export const revalidate = 300;

// TODO(phase-5): replace hero with "The Deal Grid" + remaining home sections.
export default async function HomePage() {
  const { coupons } = await listActiveCoupons({ sort: "featured", limit: 8 });
  const featured = coupons.map(toTicketCoupon);

  return (
    <>
      <Section tone="pine" padding="loose">
        <Container className="text-center">
          <Badge variant="emerald" className="mx-auto">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Verified deals, updated daily
          </Badge>
          <h1 className="mx-auto mt-6 max-w-3xl text-display-xl font-bold text-white">
            Find the <span className="text-emerald">code</span> before you
            checkout.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-body-lg text-mint/85">
            Editorial coverage and verified coupon codes for the AI tools and
            SaaS products you already want.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button href="/coupons" size="lg">
              <Ticket className="h-5 w-5" aria-hidden="true" />
              Browse deals
            </Button>
            <Button href="/stores" variant="glassDark" size="lg">
              Explore stores
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </Container>
      </Section>

      <Section tone="mint" padding="tight">
        <Container className="text-center">
          <p className="font-mono text-sm tracking-wide text-ink-muted uppercase">
            1,000+ verified deals &middot; Updated daily &middot; Zero spam
          </p>
        </Container>
      </Section>

      <Section>
        <Container size="wide">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-h2 font-bold text-pine">Featured deals</h2>
                <p className="mt-2 text-ink-muted">
                  Hand-checked codes our editors would actually use.
                </p>
              </div>
              <Button href="/coupons" variant="secondary" size="sm">
                View all coupons
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </Reveal>
          <CouponGrid coupons={featured} className="mt-8" />
        </Container>
      </Section>
    </>
  );
}
