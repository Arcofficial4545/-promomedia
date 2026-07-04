/** Minimal Tiptap JSON node model + helpers shared by renderer and TOC. */

export type TiptapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

export type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
};

export function nodeText(node: TiptapNode): string {
  if (node.text) return node.text;
  return (node.content ?? []).map(nodeText).join("");
}

export function headingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 64);
}

export type TocEntry = { id: string; text: string; level: number };

/** Collect h2/h3 headings for the table of contents. */
export function collectHeadings(doc: TiptapNode): TocEntry[] {
  const entries: TocEntry[] = [];
  for (const node of doc.content ?? []) {
    if (node.type === "heading") {
      const level = Number(node.attrs?.level ?? 2);
      if (level === 2 || level === 3) {
        const text = nodeText(node);
        entries.push({ id: headingId(text), text, level });
      }
    }
  }
  return entries;
}

/** Collect all embedded coupon ids so the page can prefetch them. */
export function collectCouponIds(node: TiptapNode): string[] {
  const ids: string[] = [];
  if (node.type === "couponEmbed" && typeof node.attrs?.couponId === "string") {
    ids.push(node.attrs.couponId);
  }
  for (const child of node.content ?? []) {
    ids.push(...collectCouponIds(child));
  }
  return [...new Set(ids)];
}
