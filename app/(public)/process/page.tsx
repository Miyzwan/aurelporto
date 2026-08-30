import { notFound } from "next/navigation";

import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { Section } from "@/components/public/Section";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicPageSectionRenderer } from "@/components/public/PublicPageSectionRenderer";
import { getPublicPageData } from "@/lib/content/public-pages";
import { getPublishedProcessSteps } from "@/lib/data/process";

export const dynamic = "force-dynamic";

export default async function ProcessPage() {
  const pageData = await getPublicPageData("process");
  if (!pageData) notFound();

  const steps = await getPublishedProcessSteps();

  return (
    <>
      <PublicPageHeader page={pageData.page} />
      <PublicPageSectionRenderer sections={pageData.sections} />
      <Section tight>
        <ProcessTimeline steps={steps} />
      </Section>
    </>
  );
}
