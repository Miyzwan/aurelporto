import { HomeSectionRenderer } from "@/components/home/HomeSectionRenderer";
import { getHomePageSections } from "@/lib/content/home-sections";

/**
 * Home content is request-time data. The adapter reads only published/enabled
 * rows and resolves the optional relations before the renderer dispatches
 * through the public section registry.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sections = await getHomePageSections();

  return <HomeSectionRenderer sections={sections} />;
}
