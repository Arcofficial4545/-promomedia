import Link from "next/link";
import { Download } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ClicksLineChart, TopBarChart } from "@/components/admin/charts";
import {
  clicksPerDay,
  countClicksSince,
  topCouponsByClicks,
  topPostsByViews,
  topStoresByClicks,
} from "@/lib/db/repositories/clicks";
import { countSubscribersSince } from "@/lib/db/repositories/newsletter";
import { cn, formatNumber } from "@/lib/utils";

const RANGES = [7, 30, 90] as const;

function sinceDate(rangeDays: number): Date {
  return new Date(Date.now() - rangeDays * 86_400_000);
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = (RANGES as readonly number[]).includes(Number(rangeParam))
    ? (Number(rangeParam) as (typeof RANGES)[number])
    : 30;
  const since = sinceDate(range);

  const [totalClicks, perDay, topCoupons, topStores, topPosts, newSubs] =
    await Promise.all([
      countClicksSince(since),
      clicksPerDay(since),
      topCouponsByClicks(since, 10),
      topStoresByClicks(since, 8),
      topPostsByViews(8),
      countSubscribersSince(since),
    ]);

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description={`${formatNumber(totalClicks)} redirect clicks and ${formatNumber(newSubs)} new subscribers in the last ${range} days`}
      >
        <a
          href={`/admin/analytics/export?range=${range}`}
          className="inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-btn)] border border-line-strong bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-emerald-600"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </a>
      </AdminPageHeader>

      <div className="mb-5 flex gap-1.5">
        {RANGES.map((r) => (
          <Link
            key={r}
            href={`/admin/analytics?range=${r}`}
            className={cn(
              "inline-flex h-9 items-center rounded-[var(--radius-btn)] border px-3.5 text-sm font-medium transition-colors",
              r === range
                ? "border-pine bg-pine text-white"
                : "border-line bg-white text-ink-muted hover:border-emerald-600",
            )}
          >
            {r} days
          </Link>
        ))}
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
        <h2 className="font-display font-semibold text-pine">
          Clicks per day
        </h2>
        <div className="mt-4">
          {perDay.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-subtle">
              No clicks in this range.
            </p>
          ) : (
            <ClicksLineChart data={perDay} />
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
          <h2 className="font-display font-semibold text-pine">Top stores</h2>
          <div className="mt-4">
            {topStores.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-subtle">No data.</p>
            ) : (
              <TopBarChart
                data={topStores.map((s) => ({
                  name: s.storeName,
                  value: s.clicks,
                }))}
              />
            )}
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-line bg-white p-5">
          <h2 className="font-display font-semibold text-pine">
            Top blog posts (all time)
          </h2>
          <table className="mt-4 w-full text-sm">
            <tbody>
              {topPosts.map((post, i) => (
                <tr key={post.postId} className="border-b border-line last:border-0">
                  <td className="w-8 py-2 font-mono text-xs text-ink-subtle">
                    {i + 1}
                  </td>
                  <td className="max-w-72 truncate py-2 pr-3 font-medium text-ink">
                    {post.title}
                  </td>
                  <td className="py-2 text-right font-mono font-semibold text-pine">
                    {formatNumber(post.views)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 rounded-[var(--radius-card)] border border-line bg-white p-5">
        <h2 className="font-display font-semibold text-pine">Top coupons</h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-ink-subtle">
              <th className="pb-2 font-medium">Coupon</th>
              <th className="pb-2 font-medium">Store</th>
              <th className="pb-2 text-right font-medium">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {topCoupons.map((coupon) => (
              <tr key={coupon.couponId} className="border-b border-line last:border-0">
                <td className="max-w-96 truncate py-2 pr-3 font-medium text-ink">
                  {coupon.title}
                </td>
                <td className="py-2 pr-3 text-ink-muted">{coupon.storeName}</td>
                <td className="py-2 text-right font-mono font-semibold text-pine">
                  {formatNumber(coupon.clicks)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
