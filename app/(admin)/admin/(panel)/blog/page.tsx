import Link from "next/link";
import { Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/Badge";
import { adminListPosts } from "@/lib/db/repositories/posts";
import { formatDate, formatNumber } from "@/lib/utils";

export default async function AdminBlogPage() {
  const posts = await adminListPosts();

  return (
    <>
      <AdminPageHeader
        title="Blog"
        description={`${posts.length} posts`}
        createHref="/admin/blog/new"
        createLabel="New post"
      />
      <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-mint/60 text-left text-pine">
              <th className="px-3 py-2.5 font-semibold">Post</th>
              <th className="px-3 py-2.5 font-semibold">Category</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5 font-semibold">Published</th>
              <th className="px-3 py-2.5 font-semibold">Views</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-line last:border-0 hover:bg-mint/30">
                <td className="max-w-80 px-3 py-2.5">
                  <p className="truncate font-medium text-ink">{post.title}</p>
                  <p className="font-mono text-xs text-ink-subtle">/{post.slug}</p>
                </td>
                <td className="px-3 py-2.5 text-ink-muted">
                  {post.category?.name ?? "—"}
                </td>
                <td className="px-3 py-2.5">
                  <Badge variant={post.status === "published" ? "verified" : "warning"}>
                    {post.status}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-ink-muted">
                  {post.publishedAt ? formatDate(post.publishedAt) : "—"}
                </td>
                <td className="px-3 py-2.5 font-mono">
                  {formatNumber(post.viewCount)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="inline-flex h-8 items-center gap-1 rounded-[var(--radius-btn)] border border-line px-2.5 text-xs font-medium text-ink transition-colors hover:border-emerald-600"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
