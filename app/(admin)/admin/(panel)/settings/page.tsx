import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsForm } from "@/components/admin/forms/SettingsForm";
import { requireAdmin } from "@/lib/auth/current";
import { getSettings } from "@/lib/db/repositories/settings";

export default async function AdminSettingsPage() {
  await requireAdmin("admin");
  const settings = await getSettings();

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Site defaults, disclosure copy, and global popup rules."
      />
      <SettingsForm settings={settings} />
    </>
  );
}
