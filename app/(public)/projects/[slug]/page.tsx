import { notFound } from "next/navigation";

import { NextProject } from "@/components/projects/NextProject";
import { ProjectFacts } from "@/components/projects/ProjectFacts";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectSectionRenderer } from "@/components/public/ProjectSectionRenderer";
import { placeholderSectionsFor } from "@/lib/content/placeholder-case-study";
import { placeholderProjects } from "@/lib/content/placeholder-projects";

export function generateStaticParams() {
  return placeholderProjects.map((project) => ({ slug: project.slug }));
}

/**
 * INT-007 replaces the fixture lookups with published-only Supabase reads and
 * INT-015 adds database-driven metadata. The section order comes from
 * `sort_order`, resolved inside ProjectSectionRenderer.
 */
export default async function ProjectCaseStudyPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;

  const index = placeholderProjects.findIndex((project) => project.slug === slug);
  if (index === -1) notFound();

  const project = placeholderProjects[index]!;
  const next = placeholderProjects[(index + 1) % placeholderProjects.length] ?? null;

  return (
    <>
      <ProjectHero project={project} />
      <ProjectFacts project={project} />
      <ProjectSectionRenderer sections={placeholderSectionsFor(slug)} />
      <NextProject project={next?.slug === slug ? null : next} />
    </>
  );
}
