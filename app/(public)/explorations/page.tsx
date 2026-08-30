import { notFound } from "next/navigation";

import { ExplorationGallery } from "@/components/explorations/ExplorationGallery";
import { Section } from "@/components/public/Section";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicPageSectionRenderer } from "@/components/public/PublicPageSectionRenderer";
import { getPublicPageData } from "@/lib/content/public-pages";
import { getPublishedExplorations } from "@/lib/data/explorations";

export const dynamic = "force-dynamic";

export default async function ExplorationsPage() {
  const pageData = await getPublicPageData("explorations");
  if (!pageData) notFound();

  const explorations = await getPublishedExplorations();

  return (
    <>
      <PublicPageHeader page={pageData.page} />
      <PublicPageSectionRenderer sections={pageData.sections} />
      <Section tight>
        <ExplorationGallery explorations={explorations} />
      </Section>
    </>
  );
}
