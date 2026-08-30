import { notFound } from "next/navigation";

import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicPageSectionRenderer } from "@/components/public/PublicPageSectionRenderer";
import { getPublicPageData } from "@/lib/content/public-pages";
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const pageData = await getPublicPageData("about");
  if (!pageData) notFound();

  return (
    <>
      <PublicPageHeader page={pageData.page} />
      <PublicPageSectionRenderer sections={pageData.sections} />
    </>
  );
}
