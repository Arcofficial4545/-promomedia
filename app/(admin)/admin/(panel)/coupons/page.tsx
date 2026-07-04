import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CouponsTable } from "@/components/admin/tables/CouponsTable";
import { adminListCoupons } from "@/lib/db/repositories/coupons";

function toRows(coupons: Awaited<ReturnType<typeof adminListCoupons>>) {
  const now = Date.now();
  return coupons.map((c) => ({
    id: c.id,
    title: c.title,
    storeName: c.store.name,
    type: c.type,
    code: c.code,
    discountLabel: c.discountLabel,
    clickCount: c.clickCount,
    isVerified: c.isVerified,
    isActive: c.isActive,
    expiresAt: c.expiresAt?.toISOString() ?? null,
    expired: c.expiresAt !== null && c.expiresAt.getTime() <= now,
  }));
}

export default async function AdminCouponsPage() {
  const coupons = await adminListCoupons();

  return (
    <>
      <AdminPageHeader
        title="Coupons"
        description={`${coupons.length} total`}
        createHref="/admin/coupons/new"
        createLabel="New coupon"
      />
      <CouponsTable coupons={toRows(coupons)} />
    </>
  );
}
