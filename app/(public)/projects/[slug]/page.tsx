import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { NextProject } from "@/components/projects/NextProject";
import { ProjectFacts } from "@/components/projects/ProjectFacts";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { ProjectSectionRenderer } from "@/components/public/ProjectSectionRenderer";
import {
  getNextPublishedProject,
  getPublishedProjectBySlug,
  getPublishedProjects,
  getPublishedProjectSections,
} from "@/lib/data/projects";
import { getPublicSiteSettings } from "@/lib/data/site";
import { generateProjectMetadata } from "@/lib/seo/metadata";
import {
  buildBreadcrumbSchema,
  buildProjectSchema,
  StructuredData,
} from "@/lib/seo/structured-data";

import { placeholderSiteSettings } from "@/lib/content/placeholder-shell";

export async function generateStaticParams() {
  const projects = await getPublishedProjects().catch(() => []);
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return generateProjectMetadata(slug);
}

export default async function ProjectCaseStudyPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;

  const project = await getPublishedProjectBySlug(slug).catch(() => null);
  if (!project) notFound();

  const [sections, next, siteSettings] = await Promise.all([
    getPublishedProjectSections(project.id).catch(() => []),
    getNextPublishedProject(project.id).catch(() => null),
    getPublicSiteSettings().catch(() => placeholderSiteSettings),
  ]);

  const projectSchema = buildProjectSchema(project, siteSettings);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Projects", path: "/projects" },
    { name: project.title, path: `/projects/${project.slug}` },
  ]);

  return (
    <>
      <StructuredData data={[projectSchema, breadcrumbSchema]} />
      <ProjectHero project={project} />
      <ProjectFacts project={project} />
      <ProjectSectionRenderer sections={sections} />
      <NextProject project={next?.slug === slug ? null : next} />
    </>
  );
}
