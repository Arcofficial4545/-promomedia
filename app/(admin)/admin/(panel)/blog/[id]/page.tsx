import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PostForm } from "@/components/admin/forms/PostForm";
import { removePost } from "@/lib/actions/admin/posts";
import { listCategories } from "@/lib/db/repositories/categories";
import { listActiveCoupons } from "@/lib/db/repositories/coupons";
import {
  adminGetPost,
  listAuthors,
  listRelatedStoreIds,
} from "@/lib/db/repositories/posts";
import { adminListStores } from "@/lib/db/repositories/stores";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await adminGetPost(id);
  if (!post) notFound();

  const [authors, categories, stores, { coupons }, relatedStoreIds] =
    await Promise.all([
      listAuthors(),
      listCategories(),
      adminListStores(),
      listActiveCoupons({ limit: 100 }),
      listRelatedStoreIds(post.id),
    ]);

  const removeThisPost = removePost.bind(null, post.id);

  return (
    <>
      <AdminPageHeader title={`Edit: ${post.title}`}>
        <DeleteButton
          action={removeThisPost}
          label="this post"
          redirectTo="/admin/blog"
        />
      </AdminPageHeader>
      <PostForm
        post={post}
        relatedStoreIds={relatedStoreIds}
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
