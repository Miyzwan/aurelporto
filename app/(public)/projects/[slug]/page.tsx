import { notFound } from "next/navigation";

import { NextProject } from "@/components/projects/NextProject";
import { ProjectFacts } from "@/components/projects/ProjectFacts";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectSectionRenderer } from "@/components/public/ProjectSectionRenderer";
import {
  getNextPublishedProject,
  getPublishedProjectBySlug,
  getPublishedProjectSections,
} from "@/lib/data/projects";

/** Project content is read on every request so publish state is authoritative. */
export const dynamic = "force-dynamic";

export default async function ProjectCaseStudyPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;

  const project = await getPublishedProjectBySlug(slug);
  if (!project) notFound();

  const [sections, next] = await Promise.all([
    getPublishedProjectSections(project.id),
    getNextPublishedProject(project.id),
  ]);

  return (
    <>
      <ProjectHero project={project} />
      <ProjectFacts project={project} />
      <ProjectSectionRenderer sections={sections} />
      <NextProject project={next?.slug === slug ? null : next} />
    </>
  );
}
