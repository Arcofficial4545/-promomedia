import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaManager } from "@/components/admin/MediaManager";
import { storage } from "@/lib/adapters/storage";

export default async function AdminMediaPage() {
  const files = await storage.list();

  return (
    <>
      <AdminPageHeader
        title="Media library"
        description={`${files.length} files in local storage`}
      />
      <MediaManager
        files={files.map((f) => ({
          url: f.url,
          size: f.size,
          modifiedAt: f.modifiedAt.toISOString(),
        }))}
      />
    </>
  );
}
