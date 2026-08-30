import { notFound } from "next/navigation";

import { PageDetailScreen } from "@/components/admin";
import { createMediaAsset } from "@/lib/actions/media";
import {
  createPageSection,
  deletePageSection,
  reorderPageSections,
  togglePageSection,
  updatePageMetadata,
  updatePageSection,
} from "@/lib/actions/pages";
import { getAdminMediaPickerAssets } from "@/lib/data/media";
import { getAdminPageBySlug } from "@/lib/data/pages";

export default async function AdminPageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [pageData, mediaAssets] = await Promise.all([
    getAdminPageBySlug(slug),
    getAdminMediaPickerAssets(),
  ]);

  if (!pageData) notFound();

  return (
    <PageDetailScreen
      page={pageData.page}
      initialSections={pageData.sections}
      mediaAssets={mediaAssets}
      updatePageAction={updatePageMetadata}
      createSectionAction={createPageSection}
      updateSectionAction={updatePageSection}
      toggleSectionAction={togglePageSection}
      deleteSectionAction={deletePageSection}
      reorderSectionsAction={reorderPageSections}
      uploadAction={createMediaAsset}
    />
  );
}
