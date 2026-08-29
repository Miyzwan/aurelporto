import { ProjectCard } from "@/components/public/ProjectCard";
import type { ProjectSummary } from "@/types/content";

interface ProjectGridProps {
  projects: ProjectSummary[];
  emptyMessage?: string;
}

/**
 * Variable aspect ratios keep the index from reading as a uniform card wall
 * (PRD section 29). The cycle is deterministic so a project does not change
 * shape between filter states.
 */
const ASPECT_CYCLE = [4 / 3, 3 / 4, 1, 4 / 5] as const;

export function ProjectGrid({ projects, emptyMessage }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="rule-hairline py-16">
        <p className="type-body text-foreground-muted">
          {emptyMessage ?? "No projects in this category yet."}
        </p>
      </div>
    );
  }

  return (
    // A CSS column flow rather than grid rows. No ordinal is shown here: the
    // flow is column-major, so numbering would read 01, 05, 02, 06 across the
    // page. The home featured list keeps its ordinals because it is strictly
    // vertical. With variable aspect ratios a
    // grid row is as tall as its tallest card, which strands a large dead gap
    // under every shorter one; columns pack independently, so uneven heights
    // read as editorial rhythm. DOM order is preserved, so reading and tab
    // order still follow sort_order.
    <div className="tablet:columns-2 columns-1 gap-x-(--spacing-gutter)">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          aspectRatio={ASPECT_CYCLE[index % ASPECT_CYCLE.length]}
          sizes="(min-width: 768px) 50vw, 100vw"
          priority={index < 2}
          className="mb-(--spacing-section-tight) break-inside-avoid"
        />
      ))}
    </div>
  );
}
