import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PromoForm } from "@/components/admin/forms/PromoForm";
import { removePromo } from "@/lib/actions/admin/promos";
import { listActiveCoupons } from "@/lib/db/repositories/coupons";
import { adminGetPromo } from "@/lib/db/repositories/promos";

export default async function EditPromoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [promo, { coupons }] = await Promise.all([
    adminGetPromo(id),
    listActiveCoupons({ limit: 100 }),
  ]);
  if (!promo) notFound();

  const removeThisPromo = removePromo.bind(null, promo.id);

  return (
    <>
      <AdminPageHeader title={`Edit: ${promo.name}`}>
        <DeleteButton
          action={removeThisPromo}
          label={promo.name}
          redirectTo="/admin/promos"
        />
      </AdminPageHeader>
      <PromoForm
        promo={promo}
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
