"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { Megaphone, Ticket } from "lucide-react";

export type EditorCouponOption = {
  id: string;
  title: string;
  storeName: string;
  discountLabel: string;
};

/* ------------------------------ couponEmbed ---------------------------- */

function CouponEmbedView({ node, extension, deleteNode }: NodeViewProps) {
  const couponId = String(node.attrs.couponId ?? "");
  const options = (extension.options.coupons ?? []) as EditorCouponOption[];
  const coupon = options.find((c) => c.id === couponId);

  return (
    <NodeViewWrapper>
      <div
        data-coupon-embed={couponId}
        className="my-3 flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-emerald-600 bg-mint px-4 py-3"
        contentEditable={false}
      >
        <span className="flex min-w-0 items-center gap-2.5 text-sm">
          <Ticket className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          {coupon ? (
            <span className="truncate">
              <span className="font-semibold text-pine">{coupon.storeName}</span>
              {" · "}
              <span className="font-mono font-bold text-pine">
                {coupon.discountLabel}
              </span>
              {" — "}
              <span className="text-ink-muted">{coupon.title}</span>
            </span>
          ) : (
            <span className="text-danger">Coupon not found ({couponId.slice(0, 8)})</span>
          )}
        </span>
        <button
          type="button"
          onClick={deleteNode}
          className="shrink-0 text-xs font-medium text-ink-muted hover:text-danger"
        >
          Remove
        </button>
      </div>
    </NodeViewWrapper>
  );
}

export const CouponEmbed = Node.create<{ coupons: EditorCouponOption[] }>({
  name: "couponEmbed",
  group: "block",
  atom: true,

  addOptions() {
    return { coupons: [] };
  },

  addAttributes() {
    return {
      couponId: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-coupon-embed]",
        getAttrs: (el) => ({
          couponId: (el as HTMLElement).getAttribute("data-coupon-embed"),
        }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-coupon-embed": node.attrs.couponId,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CouponEmbedView);
  },
});

/* ------------------------------- promoSlot ----------------------------- */

function PromoSlotView({ deleteNode }: NodeViewProps) {
  return (
    <NodeViewWrapper>
      <div
        data-promo-slot="in-content"
        className="my-3 flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-line-strong bg-white px-4 py-3"
        contentEditable={false}
      >
        <span className="flex items-center gap-2.5 text-sm text-ink-muted">
          <Megaphone className="h-4 w-4 shrink-0 text-pine" aria-hidden="true" />
          In-content promo slot — filled by the active promo at render time
        </span>
        <button
          type="button"
          onClick={deleteNode}
          className="shrink-0 text-xs font-medium text-ink-muted hover:text-danger"
        >
          Remove
        </button>
      </div>
    </NodeViewWrapper>
  );
}

export const PromoSlotNode = Node.create({
  name: "promoSlot",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      placement: { default: "in-content" },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-promo-slot]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-promo-slot": "in-content" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PromoSlotView);
  },
});
