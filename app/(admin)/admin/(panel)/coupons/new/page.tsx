import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CouponForm } from "@/components/admin/forms/CouponForm";
import { adminListStores } from "@/lib/db/repositories/stores";

export default async function NewCouponPage() {
  const stores = await adminListStores();

  return (
    <>
      <AdminPageHeader title="New coupon" />
      <CouponForm
        coupon={null}
        stores={stores.map((s) => ({ id: s.id, name: s.name }))}
      />
    </>
  );
}
