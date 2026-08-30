import { notFound } from "next/navigation";

import { ServiceList } from "@/components/services/ServiceList";
import { Section } from "@/components/public/Section";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicPageSectionRenderer } from "@/components/public/PublicPageSectionRenderer";
import { getPublicPageData } from "@/lib/content/public-pages";
import { getPublishedServiceDetails } from "@/lib/data/services";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const pageData = await getPublicPageData("services");
  if (!pageData) notFound();

  const services = await getPublishedServiceDetails();

  return (
    <>
      <PublicPageHeader page={pageData.page} />
      <PublicPageSectionRenderer sections={pageData.sections} />
      <Section tight>
        <ServiceList services={services} />
      </Section>
    </>
  );
}
