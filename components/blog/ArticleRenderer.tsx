import Image from "next/image";
import Link from "next/link";
import { CouponTicket, type TicketCoupon } from "@/components/coupon/CouponTicket";
import { headingId, nodeText, type TiptapMark, type TiptapNode } from "./tiptap";

type RenderContext = {
  /** Prefetched coupons for couponEmbed nodes, keyed by id. */
  coupons: Map<string, TicketCoupon>;
  /** Renders in-content promo slots (wired in Phase 7). */
  promoSlot?: React.ReactNode;
};

function renderMarks(
  text: React.ReactNode,
  marks: TiptapMark[] | undefined,
  key: number,
): React.ReactNode {
  if (!marks || marks.length === 0) return text;
  return marks.reduce((child, mark, i) => {
    switch (mark.type) {
      case "bold":
        return <strong key={`${key}-${i}`}>{child}</strong>;
      case "italic":
        return <em key={`${key}-${i}`}>{child}</em>;
      case "code":
        return (
          <code
            key={`${key}-${i}`}
            className="rounded bg-mint px-1.5 py-0.5 font-mono text-[0.85em] font-semibold tracking-wide text-pine uppercase"
          >
            {child}
          </code>
        );
      case "link": {
        const href = String(mark.attrs?.href ?? "#");
        const external = /^https?:\/\//.test(href);
        return external ? (
          <a
            key={`${key}-${i}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-pine underline decoration-emerald decoration-2 underline-offset-4 hover:text-emerald-600"
          >
            {child}
          </a>
        ) : (
          <Link
            key={`${key}-${i}`}
            href={href}
            className="font-medium text-pine underline decoration-emerald decoration-2 underline-offset-4 hover:text-emerald-600"
          >
            {child}
          </Link>
        );
      }
      default:
        return child;
    }
  }, text);
}

function RenderNode({
  node,
  ctx,
  index,
}: {
  node: TiptapNode;
  ctx: RenderContext;
  index: number;
}): React.ReactNode {
  const children = (node.content ?? []).map((child, i) => (
    <RenderNode key={i} node={child} ctx={ctx} index={i} />
  ));

  switch (node.type) {
    case "text":
      return renderMarks(node.text ?? "", node.marks, index);

    case "paragraph":
      return (
        <p className="my-5 leading-relaxed text-ink-muted first:mt-0">
          {children}
        </p>
      );

    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      const id = headingId(nodeText(node));
      if (level === 3) {
        return (
          <h3
            id={id}
            className="mt-9 mb-4 scroll-mt-24 text-h4 font-bold text-pine"
          >
            {children}
          </h3>
        );
      }
      if (level >= 4) {
        return (
          <h4 id={id} className="mt-7 mb-3 scroll-mt-24 font-display text-lg font-bold text-pine">
            {children}
          </h4>
        );
      }
      return (
        <h2
          id={id}
          className="mt-12 mb-5 scroll-mt-24 text-h3 font-bold text-pine"
        >
          {children}
        </h2>
      );
    }

    case "bulletList":
      return (
        <ul className="my-5 list-disc space-y-2.5 pl-6 leading-relaxed text-ink-muted marker:text-emerald-600">
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol className="my-5 list-decimal space-y-2.5 pl-6 leading-relaxed text-ink-muted marker:font-semibold marker:text-pine">
          {children}
        </ol>
      );

    case "listItem":
      return <li className="[&>p]:my-0">{children}</li>;

    case "blockquote":
      return (
        <blockquote className="my-8 border-l-4 border-emerald bg-mint px-6 py-4 font-display text-lg font-medium text-pine [&>p]:my-0 [&>p]:text-pine">
          {children}
        </blockquote>
      );

    case "horizontalRule":
      return <hr className="my-10 border-line" />;

    case "codeBlock":
      return (
        <pre className="my-6 overflow-x-auto rounded-xl bg-pine-900 p-5 font-mono text-sm leading-relaxed text-mint">
          <code>{nodeText(node)}</code>
        </pre>
      );

    case "image": {
      const src = String(node.attrs?.src ?? "");
      const alt = String(node.attrs?.alt ?? "");
      if (!src) return null;
      return (
        <figure className="my-8">
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={675}
            className="w-full rounded-xl border border-line"
          />
          {alt && (
            <figcaption className="mt-2 text-center text-sm text-ink-subtle">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    case "couponEmbed": {
      const couponId = String(node.attrs?.couponId ?? "");
      const coupon = ctx.coupons.get(couponId);
      if (!coupon) return null;
      return (
        <div className="my-8 not-prose">
          <CouponTicket coupon={coupon} tone="mint" />
        </div>
      );
    }

    case "promoSlot":
      return ctx.promoSlot ? (
        <div className="my-8">{ctx.promoSlot}</div>
      ) : null;

    case "doc":
      return children;

    default:
      // Unknown node types render their children rather than breaking.
      return children;
  }
}

type ArticleRendererProps = {
  doc: TiptapNode;
  coupons: Map<string, TicketCoupon>;
  promoSlot?: React.ReactNode;
};

/** Blocks to render before an auto-injected in-content promo. */
const AUTO_INJECT_AFTER_BLOCKS = 5;

function hasPromoSlot(node: TiptapNode): boolean {
  if (node.type === "promoSlot") return true;
  return (node.content ?? []).some(hasPromoSlot);
}

/**
 * Renders Tiptap JSON to styled React, including live coupon embeds.
 * If the document has no explicit promoSlot node, the in-content promo is
 * auto-injected after the first few blocks.
 */
export function ArticleRenderer({ doc, coupons, promoSlot }: ArticleRendererProps) {
  let renderedDoc = doc;
  if (promoSlot && !hasPromoSlot(doc) && (doc.content?.length ?? 0) > AUTO_INJECT_AFTER_BLOCKS + 1) {
    renderedDoc = {
      ...doc,
      content: [
        ...doc.content!.slice(0, AUTO_INJECT_AFTER_BLOCKS),
        { type: "promoSlot" },
        ...doc.content!.slice(AUTO_INJECT_AFTER_BLOCKS),
      ],
    };
  }

  return (
    <div className="text-body-lg">
      <RenderNode node={renderedDoc} ctx={{ coupons, promoSlot }} index={0} />
    </div>
  );
}
