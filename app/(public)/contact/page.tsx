import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectInquiryForm } from "@/components/contact/ProjectInquiryForm";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicPageSectionRenderer } from "@/components/public/PublicPageSectionRenderer";
import { Section } from "@/components/public/Section";
import { submitInquiry } from "@/lib/actions/inquiries";
import { getPublicPageData } from "@/lib/content/public-pages";
import { getPublishedServices } from "@/lib/data/services";
import { getPublicInquiryConfig } from "@/lib/data/site";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, StructuredData } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("contact");
}

export default async function ContactPage() {
  const pageData = await getPublicPageData("contact");
  if (!pageData) notFound();

  const [config, services] = await Promise.all([getPublicInquiryConfig(), getPublishedServices()]);
  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbs} />
      <PublicPageHeader page={pageData.page} />
      <PublicPageSectionRenderer sections={pageData.sections} />
      <Section tight>
        <ProjectInquiryForm config={config} services={services} submitAction={submitInquiry} />
      </Section>
    </>
  );
}
