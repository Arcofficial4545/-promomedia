"use client";

import { useRef, useState } from "react";
import {
  EditorContent,
  useEditor,
  type Editor,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Megaphone,
  Quote,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { uploadMedia } from "@/lib/actions/admin/media";
import type { TiptapDoc } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import {
  CouponEmbed,
  PromoSlotNode,
  type EditorCouponOption,
} from "./extensions";

type TiptapEditorProps = {
  value: TiptapDoc;
  onChange: (doc: TiptapDoc, wordCount: number) => void;
  coupons: EditorCouponOption[];
};

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-mint hover:text-pine",
        active && "bg-mint text-pine",
      )}
    >
      {children}
    </button>
  );
}

function countWords(editor: Editor): number {
  return editor.state.doc.textContent.split(/\s+/).filter(Boolean).length;
}

export function TiptapEditor({ value, onChange, coupons }: TiptapEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [couponPickerOpen, setCouponPickerOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      Image,
      Placeholder.configure({ placeholder: "Write the article..." }),
      CouponEmbed.configure({ coupons }),
      PromoSlotNode,
    ],
    content: value as JSONContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TiptapDoc, countWords(editor));
    },
    editorProps: {
      attributes: {
        class:
          "tiptap-content min-h-72 px-4 py-3 focus:outline-none text-sm leading-relaxed text-ink",
      },
    },
  });

  if (!editor) {
    return (
      <div className="min-h-80 rounded-[var(--radius-input)] border border-line-strong bg-white" />
    );
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (empty to remove):", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }

  async function insertImage(file: File | undefined) {
    if (!file || !editor) return;
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadMedia(formData);
    if (result.ok && result.url) {
      editor.chain().focus().setImage({ src: result.url }).run();
    } else {
      toast(result.message);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="rounded-[var(--radius-input)] border border-line-strong bg-white focus-within:border-emerald focus-within:shadow-[0_0_0_3px_rgba(30,198,119,0.25)]">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line px-2 py-1.5">
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Inline code"
          active={editor.isActive("code")}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton label="Image" onClick={() => fileRef.current?.click()}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <span className="mx-1.5 h-5 w-px bg-line" aria-hidden="true" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setCouponPickerOpen((open) => !open)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-pine transition-colors hover:bg-mint"
            aria-expanded={couponPickerOpen}
          >
            <Ticket className="h-4 w-4" aria-hidden="true" />
            Insert coupon
          </button>
          {couponPickerOpen && (
            <div className="absolute top-9 left-0 z-20 max-h-72 w-80 overflow-y-auto rounded-xl border border-line bg-white p-1.5 shadow-lg">
              {coupons.length === 0 && (
                <p className="px-3 py-2 text-xs text-ink-subtle">
                  No active coupons available.
                </p>
              )}
              {coupons.map((coupon) => (
                <button
                  key={coupon.id}
                  type="button"
                  onClick={() => {
                    editor
                      .chain()
                      .focus()
                      .insertContent({
                        type: "couponEmbed",
                        attrs: { couponId: coupon.id },
                      })
                      .run();
                    setCouponPickerOpen(false);
                  }}
                  className="block w-full rounded-lg px-3 py-2 text-left text-xs hover:bg-mint"
                >
                  <span className="font-semibold text-pine">
                    {coupon.storeName}
                  </span>{" "}
                  <span className="font-mono font-bold text-pine">
                    {coupon.discountLabel}
                  </span>
                  <span className="mt-0.5 block truncate text-ink-muted">
                    {coupon.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().insertContent({ type: "promoSlot" }).run()
          }
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-pine transition-colors hover:bg-mint"
        >
          <Megaphone className="h-4 w-4" aria-hidden="true" />
          Promo slot
        </button>
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => insertImage(e.target.files?.[0])}
      />
    </div>
  );
}
