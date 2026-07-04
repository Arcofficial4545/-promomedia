"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadMedia } from "@/lib/actions/admin/media";
import { Field } from "@/components/admin/fields";

type LogoUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  storeName?: string;
  label?: string;
};

/** Image upload via the storage adapter, with preview. */
export function LogoUploadField({
  value,
  onChange,
  storeName,
  label = "Logo",
}: LogoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadMedia(formData);
    setUploading(false);
    if (result.ok && result.url) {
      onChange(result.url);
      toast("Image uploaded");
    } else {
      toast(result.message);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Field label={label}>
      <div className="flex items-center gap-4">
        {value ? (
          <span className="relative inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-line bg-white">
            <Image
              src={value}
              alt={storeName ? `${storeName} logo` : "Uploaded image"}
              width={56}
              height={56}
              className="h-full w-full object-contain"
            />
          </span>
        ) : (
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-pine font-display text-xl font-bold text-white">
            {(storeName ?? "?").charAt(0).toUpperCase() || "?"}
          </span>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-btn)] border border-line-strong px-3 text-sm font-medium text-ink transition-colors hover:border-emerald-600 disabled:opacity-60"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            {uploading ? "Uploading" : value ? "Replace" : "Upload"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex h-9 items-center gap-1 rounded-[var(--radius-btn)] px-2 text-sm font-medium text-ink-muted hover:text-danger"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </Field>
  );
}
