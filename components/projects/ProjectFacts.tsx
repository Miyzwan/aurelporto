import type { ProjectSummary } from "@/types/content";

interface ProjectFactsProps {
  project: ProjectSummary;
}

const STATUS_LABEL: Record<ProjectSummary["projectStatus"], string> = {
  concept: "Concept",
  ongoing: "In progress",
  completed: "Completed",
};

/**
 * Placed directly under the hero so mobile readers get the facts before the
 * long gallery (PRD section 75). Every optional fact is dropped when absent
 * rather than printed with an em dash — CLIENT_CONTEXT leaves location and
 * area unconfirmed on most projects.
 */
export function ProjectFacts({ project }: ProjectFactsProps) {
  const facts: { label: string; value: string }[] = [
    { label: "Type", value: project.projectType },
    { label: "Year", value: String(project.year) },
  ];

  if (project.location.trim()) facts.push({ label: "Location", value: project.location });
  if (project.areaSqm) facts.push({ label: "Area", value: `${project.areaSqm} m²` });
  facts.push({ label: "Status", value: STATUS_LABEL[project.projectStatus] });

  return (
    <section className="container-editorial py-(--spacing-section-tight)">
      <dl className="grid-editorial">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="rule-hairline tablet:col-span-4 desktop:col-span-2 col-span-6 pt-4"
          >
            <dt className="type-meta text-foreground-subtle">{fact.label}</dt>
            <dd className="type-spec mt-2">{fact.value}</dd>
          </div>
        ))}
      </dl>

      {project.summary.trim() ? (
        <div className="grid-editorial mt-12">
          <p className="type-subheading desktop:col-span-8 col-span-12">{project.summary}</p>
        </div>
      ) : null}
    </section>
  );
}
