import { notFound } from "next/navigation";

import { ProjectInquiryForm } from "@/components/contact/ProjectInquiryForm";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicPageSectionRenderer } from "@/components/public/PublicPageSectionRenderer";
import { Section } from "@/components/public/Section";
import { submitInquiry } from "@/lib/actions/inquiries";
import { getPublicPageData } from "@/lib/content/public-pages";
import { getPublishedServices } from "@/lib/data/services";
import { getPublicInquiryConfig } from "@/lib/data/site";

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
        <ProjectInquiryForm config={config} services={services} submitAction={submitInquiry} />
      </Section>
    </>
  );
}
