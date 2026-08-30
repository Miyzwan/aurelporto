import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicPageSectionRenderer } from "@/components/public/PublicPageSectionRenderer";
import { Section } from "@/components/public/Section";
import { getPublicPageData } from "@/lib/content/public-pages";
import { getPublishedProcessSteps } from "@/lib/data/process";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, StructuredData } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("process");
}

export default async function ProcessPage() {
  const pageData = await getPublicPageData("process");
  if (!pageData) notFound();

  const steps = await getPublishedProcessSteps();
  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Process", path: "/process" },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbs} />
      <PublicPageHeader page={pageData.page} />
      <PublicPageSectionRenderer sections={pageData.sections} />
      <Section tight>
        <ProcessTimeline steps={steps} />
      </Section>
    </>
  );
}
