import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { CouponTicket, type TicketCoupon } from "./CouponTicket";

type CouponGridProps = {
  coupons: TicketCoupon[];
  tone?: "white" | "mint";
  hideStore?: boolean;
  columns?: 1 | 2;
  className?: string;
  /** Stagger the scroll-reveal of tickets. */
  animated?: boolean;
};

export function CouponGrid({
  coupons,
  tone,
  hideStore,
  columns = 2,
  className,
  animated = true,
}: CouponGridProps) {
  const gridClass = cn(
    "grid gap-4 sm:gap-5",
    columns === 2 ? "lg:grid-cols-2" : "",
    className,
  );

  if (!animated) {
    return (
      <div className={gridClass}>
        {coupons.map((coupon) => (
          <CouponTicket
            key={coupon.id}
            coupon={coupon}
            tone={tone}
            hideStore={hideStore}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {coupons.map((coupon, i) => (
        <Reveal key={coupon.id} delay={Math.min(i % 4, 3) * 0.07}>
          <CouponTicket coupon={coupon} tone={tone} hideStore={hideStore} />
        </Reveal>
      ))}
    </div>
  );
}
