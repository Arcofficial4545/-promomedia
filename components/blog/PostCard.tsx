import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PostWithMeta } from "@/lib/db/repositories/posts";
import { formatDate } from "@/lib/utils";

type PostCardProps = {
  post: PostWithMeta;
  featured?: boolean;
};

export function PostCard({ post, featured = false }: PostCardProps) {
  if (featured) {
    return (
      <Card
        tone="pine"
        interactive
        className="relative flex flex-col justify-between p-8 sm:p-10"
      >
        <div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-mint/70">
            {post.category && (
              <Badge variant="emerald">{post.category.name}</Badge>
            )}
            <span>
              {post.publishedAt ? formatDate(post.publishedAt) : "Draft"}
            </span>
            <span aria-hidden="true">&middot;</span>
            <span>{post.readingMinutes} min read</span>
          </div>
          <h2 className="mt-5 max-w-2xl font-display text-h2 leading-tight font-bold text-white">
            <Link
              href={`/blog/${post.slug}`}
              className="after:absolute after:inset-0"
            >
              {post.title}
            </Link>
          </h2>
          <p className="mt-4 max-w-2xl text-body-lg leading-relaxed text-mint/85">
            {post.excerpt}
          </p>
        </div>
        <p className="mt-8 text-sm font-semibold text-emerald">
          Read the full article
        </p>
      </Card>
    );
  }

  return (
    <Card interactive className="relative flex h-full flex-col p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-ink-subtle">
        {post.category && <Badge variant="default">{post.category.name}</Badge>}
        <span>{post.publishedAt ? formatDate(post.publishedAt) : "Draft"}</span>
        <span aria-hidden="true">&middot;</span>
        <span>{post.readingMinutes} min read</span>
      </div>
      <h3 className="mt-3 font-display text-xl leading-snug font-semibold text-ink">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
          {post.title}
        </Link>
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">
        {post.excerpt}
      </p>
      <p className="mt-auto pt-4 text-xs text-ink-subtle">
        By {post.author.name}
      </p>
    </Card>
  );
}
