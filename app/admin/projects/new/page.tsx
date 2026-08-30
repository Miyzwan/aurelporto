import { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getAdminMediaPickerAssets } from "@/lib/data/media";
import { ProjectDetailScreen } from "@/components/admin/ProjectDetailScreen";

export const metadata: Metadata = {
  title: "New Project | Admin CMS",
  robots: { index: false, follow: false },
};

export default async function AdminNewProjectPage() {
  await requireAdmin();
  const assets = await getAdminMediaPickerAssets();

  return <ProjectDetailScreen isNew assets={assets} />;
}
