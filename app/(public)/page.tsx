import type { Metadata } from "next";

import { HomeSectionRenderer } from "@/components/home/HomeSectionRenderer";
import { getHomePageSections } from "@/lib/content/home-sections";
import { getPublicSiteSettings } from "@/lib/data/site";
import { generatePageMetadata } from "@/lib/seo/metadata";
import {
  buildPersonOrOrganizationSchema,
  buildWebSiteSchema,
  StructuredData,
} from "@/lib/seo/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata("home");
}

export default async function HomePage() {
  const [sections, siteSettings] = await Promise.all([
    getHomePageSections(),
    getPublicSiteSettings(),
  ]);

  const personSchema = buildPersonOrOrganizationSchema(siteSettings);
  const websiteSchema = buildWebSiteSchema(siteSettings);

  return (
    <>
      <StructuredData data={[personSchema, websiteSchema]} />
      <HomeSectionRenderer sections={sections} />
    </>
  );
}
