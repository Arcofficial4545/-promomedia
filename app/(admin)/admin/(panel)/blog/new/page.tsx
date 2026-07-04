import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PostForm } from "@/components/admin/forms/PostForm";
import { listCategories } from "@/lib/db/repositories/categories";
import { listActiveCoupons } from "@/lib/db/repositories/coupons";
import { listAuthors } from "@/lib/db/repositories/posts";
import { adminListStores } from "@/lib/db/repositories/stores";

export default async function NewPostPage() {
  const [authors, categories, stores, { coupons }] = await Promise.all([
    listAuthors(),
    listCategories(),
    adminListStores(),
    listActiveCoupons({ limit: 100 }),
  ]);

  return (
    <>
      <AdminPageHeader title="New post" />
      <PostForm
        post={null}
        relatedStoreIds={[]}
        authors={authors.map((a) => ({ id: a.id, name: a.name }))}
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        stores={stores.map((s) => ({ id: s.id, name: s.name }))}
        couponOptions={coupons.map((c) => ({
          id: c.id,
          title: c.title,
          storeName: c.store.name,
          discountLabel: c.discountLabel,
        }))}
      />
    </>
  );
}
