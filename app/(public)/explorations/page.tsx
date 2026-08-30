import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExplorationGallery } from "@/components/explorations/ExplorationGallery";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicPageSectionRenderer } from "@/components/public/PublicPageSectionRenderer";
import { Section } from "@/components/public/Section";
import { getPublicPageData } from "@/lib/content/public-pages";
import { getPublishedExplorations } from "@/lib/data/explorations";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, StructuredData } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("explorations");
}

export default async function ExplorationsPage() {
  const pageData = await getPublicPageData("explorations");
  if (!pageData) notFound();

  const explorations = await getPublishedExplorations();
  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Explorations", path: "/explorations" },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbs} />
      <PublicPageHeader page={pageData.page} />
      <PublicPageSectionRenderer sections={pageData.sections} />
      <Section tight>
        <ExplorationGallery explorations={explorations} />
      </Section>
    </>
  );
}
