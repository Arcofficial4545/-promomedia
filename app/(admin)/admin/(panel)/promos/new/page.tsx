import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PromoForm } from "@/components/admin/forms/PromoForm";
import { listActiveCoupons } from "@/lib/db/repositories/coupons";

export default async function NewPromoPage() {
  const { coupons } = await listActiveCoupons({ limit: 100 });

  return (
    <>
      <AdminPageHeader title="New promo" />
      <PromoForm
        promo={null}
        coupons={coupons.map((c) => ({
          id: c.id,
          title: c.title,
          storeName: c.store.name,
          storeSlug: c.store.slug,
          storeLogoUrl: c.store.logoUrl,
          discountLabel: c.discountLabel,
          isVerified: c.isVerified,
        }))}
      />
    </>
  );
}
