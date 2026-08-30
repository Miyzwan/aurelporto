import { notFound } from "next/navigation";

import { ProjectInquiryForm } from "@/components/contact/ProjectInquiryForm";
import { Section } from "@/components/public/Section";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicPageSectionRenderer } from "@/components/public/PublicPageSectionRenderer";
import { getPublicPageData } from "@/lib/content/public-pages";
import { getPublicInquiryConfig } from "@/lib/data/site";
import { getPublishedServices } from "@/lib/data/services";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const pageData = await getPublicPageData("contact");
  if (!pageData) notFound();

  const [config, services] = await Promise.all([getPublicInquiryConfig(), getPublishedServices()]);

  return (
    <>
      <PublicPageHeader page={pageData.page} />
      <PublicPageSectionRenderer sections={pageData.sections} />
      <Section tight>
        <ProjectInquiryForm config={config} services={services} />
      </Section>
    </>
  );
}
