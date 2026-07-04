import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { CouponForm } from "@/components/admin/forms/CouponForm";
import { removeCoupon } from "@/lib/actions/admin/coupons";
import { getCouponById } from "@/lib/db/repositories/coupons";
import { adminListStores } from "@/lib/db/repositories/stores";

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [coupon, stores] = await Promise.all([
    getCouponById(id),
    adminListStores(),
  ]);
  if (!coupon) notFound();

  const removeThisCoupon = removeCoupon.bind(null, coupon.id);

  return (
    <>
      <AdminPageHeader title="Edit coupon">
        <DeleteButton
          action={removeThisCoupon}
          label="this coupon"
          redirectTo="/admin/coupons"
        />
      </AdminPageHeader>
      <CouponForm
        coupon={coupon}
        stores={stores.map((s) => ({ id: s.id, name: s.name }))}
      />
    </>
  );
}
