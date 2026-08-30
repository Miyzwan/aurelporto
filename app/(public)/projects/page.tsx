import type { Metadata } from "next";

import { ProjectFilter, buildFilterOptions } from "@/components/projects/ProjectFilter";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { Section } from "@/components/public/Section";
import { getPublishedProjects } from "@/lib/data/projects";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, StructuredData } from "@/lib/seo/structured-data";
import { slugify } from "@/lib/utils/slugify";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await generatePageMetadata("projects");
  if (metadata.title && metadata.title !== "Page Not Found") {
    return metadata;
  }
  return {
    title: "Selected Work — Interior Architecture & Design",
    description: "Explore curated residential and commercial interior case studies.",
  };
}

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const params = await searchParams;
  const requested = typeof params.category === "string" ? params.category : null;

  const projects = await getPublishedProjects();
  const options = buildFilterOptions(projects, slugify);

  const active = options.some((option) => option.value === requested) ? requested : null;
  const visible = active ? projects.filter((p) => slugify(p.projectType) === active) : projects;

  const breadcrumbs = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbs} />
      <Section eyebrow="Projects">
        <div className="grid-editorial">
          <h1 className="type-heading desktop:col-span-8 col-span-12">Selected work</h1>
        </div>

        <div className="rule-hairline mt-12 pt-4">
          <ProjectFilter options={options} active={active} />
        </div>

        <div className="mt-12">
          <ProjectGrid
            projects={visible}
            emptyMessage={
              projects.length === 0
                ? "Projects are being prepared and will appear here shortly."
                : undefined
            }
          />
        </div>
      </Section>
    </>
  );
}
