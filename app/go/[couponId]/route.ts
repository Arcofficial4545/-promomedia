import { NextResponse, type NextRequest } from "next/server";
import { hashUserAgent } from "@/lib/analytics/hash";
import { logClick } from "@/lib/db/repositories/clicks";
import {
  getCouponById,
  incrementClickCount,
} from "@/lib/db/repositories/coupons";
import { clientKeyFromHeaders, rateLimit } from "@/lib/rateLimit";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Tracked outbound redirect: /go/[couponId]
 * Logs the click, bumps the denormalized counter, and 302-redirects to the
 * resolved destination. Logging is non-blocking so the redirect stays fast.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ couponId: string }> },
) {
  const { couponId } = await params;
  const home = new URL("/", request.url);

  if (!UUID_RE.test(couponId)) {
    return NextResponse.redirect(home, 302);
  }

  const key = `go:${clientKeyFromHeaders(request.headers)}`;
  if (!rateLimit(key, { limit: 30, windowMs: 60_000 }).ok) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  const coupon = await getCouponById(couponId);
  if (!coupon || !coupon.isActive) {
    return NextResponse.redirect(home, 302);
  }

  const destination =
    coupon.destinationUrl ??
    coupon.store.affiliateBaseUrl ??
    coupon.store.websiteUrl;

  let destinationUrl: URL;
  try {
    destinationUrl = new URL(destination);
    if (destinationUrl.protocol !== "https:" && destinationUrl.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }
  } catch {
    return NextResponse.redirect(home, 302);
  }

  const referer = request.headers.get("referer");
  let path = "";
  try {
    if (referer) path = new URL(referer).pathname;
  } catch {
    // ignore malformed referers
  }

  // Optional promo attribution: /go/[couponId]?promo=<promoId>
  const promoParam = request.nextUrl.searchParams.get("promo");
  const promoId = promoParam && UUID_RE.test(promoParam) ? promoParam : null;

  // Fire-and-forget: never make the visitor wait on analytics writes.
  void Promise.allSettled([
    logClick({
      couponId: coupon.id,
      storeId: coupon.store.id,
      promoId,
      path,
      referer: referer ? referer.slice(0, 500) : null,
      userAgentHash: hashUserAgent(request.headers.get("user-agent")),
      country: request.headers.get("x-vercel-ip-country"),
    }),
    incrementClickCount(coupon.id),
  ]);

  return NextResponse.redirect(destinationUrl, 302);
}
