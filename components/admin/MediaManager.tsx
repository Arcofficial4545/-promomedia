"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { deleteMedia, uploadMedia } from "@/lib/actions/admin/media";

type MediaFile = { url: string; size: number; modifiedAt: string };

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaManager({ files }: { files: MediaFile[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadMedia(formData);
    setUploading(false);
    toast(result.message);
    if (result.ok) router.refresh();
    if (inputRef.current) inputRef.current.value = "";
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast("URL copied");
    } catch {
      toast("Copy failed", { description: url });
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="btn-gloss btn-pine press-down inline-flex h-10 items-center gap-2 rounded-[var(--radius-btn)] px-4 text-sm font-semibold disabled:opacity-60"
      >
        <Upload className="h-4 w-4" aria-hidden="true" />
        {uploading ? "Uploading" : "Upload image"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files?.[0])}
      />

      {files.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-subtle">
          No uploads yet.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {files.map((file) => (
            <div
              key={file.url}
              className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-white"
            >
              <div className="flex h-32 items-center justify-center bg-mint/40 p-3">
                <Image
                  src={file.url}
                  alt=""
                  width={160}
                  height={110}
                  className="max-h-full w-auto object-contain"
                />
              </div>
              <div className="p-3">
                <p className="truncate font-mono text-xs text-ink-muted">
                  {file.url.split("/").pop()}
                </p>
                <p className="mt-0.5 text-xs text-ink-subtle">
                  {formatSize(file.size)}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyUrl(file.url)}
                    className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-[var(--radius-btn)] border border-line text-xs font-medium text-ink hover:border-emerald-600"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    Copy URL
                  </button>
                  {pendingDelete === file.url ? (
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(async () => {
                          const result = await deleteMedia(file.url);
                          toast(result.message);
                          setPendingDelete(null);
                          if (result.ok) router.refresh();
                        })
                      }
                      className="inline-flex h-8 items-center rounded-[var(--radius-btn)] bg-danger px-2 text-xs font-semibold text-white"
                    >
                      Sure?
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPendingDelete(file.url)}
                      aria-label={`Delete ${file.url.split("/").pop()}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-btn)] border border-line text-danger hover:border-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
