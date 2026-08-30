import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicPageSectionRenderer } from "@/components/public/PublicPageSectionRenderer";
import { Section } from "@/components/public/Section";
import { ServiceList } from "@/components/services/ServiceList";
import { getPublicPageData } from "@/lib/content/public-pages";
import { getPublishedServiceDetails } from "@/lib/data/services";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, StructuredData } from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("services");
}

export default async function ServicesPage() {
  const pageData = await getPublicPageData("services");
  if (!pageData) notFound();

  const services = await getPublishedServiceDetails();
  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbs} />
      <PublicPageHeader page={pageData.page} />
      <PublicPageSectionRenderer sections={pageData.sections} />
      <Section tight>
        <ServiceList services={services} />
      </Section>
    </>
  );
}
