import { SiteSettingsScreen } from "@/components/admin";
import { createMediaAsset } from "@/lib/actions/media";
import { updateSiteSettings } from "@/lib/actions/site";
import { getAdminMediaPickerAssets } from "@/lib/data/media";
import { getAdminSiteSettings } from "@/lib/data/site";

export default async function AdminSitePage() {
  const [settings, mediaAssets] = await Promise.all([
    getAdminSiteSettings(),
    getAdminMediaPickerAssets(),
  ]);

  return (
    <SiteSettingsScreen
      initialSettings={settings}
      mediaAssets={mediaAssets}
      updateAction={updateSiteSettings}
      uploadAction={createMediaAsset}
    />
  );
}
