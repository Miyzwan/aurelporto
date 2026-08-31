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

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("contact");
}

export default async function ContactPage() {
  const pageData = await getPublicPageData("contact");
  if (!pageData) notFound();

  const [config, services] = await Promise.all([
    getPublicInquiryConfig().catch(() => ({
      projectTypes: ["Residential", "Commercial", "Other"],
      projectStatuses: ["New Build", "Renovation", "Concept"],
      timelineOptions: ["Immediately", "1-3 Months", "3-6 Months", "Flexible"],
      budgetOptions: [],
      showBudgetField: false,
      showPhoneField: true,
      successTitle: "Thank you",
      successBody: "Your inquiry has been received.",
    })),
    getPublishedServices().catch(() => []),
  ]);
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
