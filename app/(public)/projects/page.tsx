import { ProjectFilter, buildFilterOptions } from "@/components/projects/ProjectFilter";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { Section } from "@/components/public/Section";
import { getPublishedProjects } from "@/lib/data/projects";
import { slugify } from "@/lib/utils/slugify";

/**
 * The index is request-rendered so published content and category counts are
 * current after an admin changes project visibility or ordering.
 */
export const dynamic = "force-dynamic";

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const params = await searchParams;
  const requested = typeof params.category === "string" ? params.category : null;

  const projects = await getPublishedProjects();
  const options = buildFilterOptions(projects, slugify);

  // An unknown category falls back to All rather than rendering an empty page
  // for a URL the visitor may have edited or a stale link.
  const active = options.some((option) => option.value === requested) ? requested : null;
  const visible = active ? projects.filter((p) => slugify(p.projectType) === active) : projects;

  return (
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
  );
}
