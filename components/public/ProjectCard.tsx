import Link from "next/link";

import { ImageMedia } from "@/components/public/ImageMedia";
import { cn } from "@/lib/utils/cn";
import type { ProjectSummary } from "@/types/content";

interface ProjectCardProps {
  project: ProjectSummary;
  /** Ordinal shown in the editorial index, e.g. "01". */
  index?: number;
  aspectRatio?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

const STATUS_LABEL: Record<ProjectSummary["projectStatus"], string> = {
  concept: "Concept",
  ongoing: "In progress",
  completed: "Completed",
};

/**
 * All metadata is rendered in the document, never revealed on hover — PRD
 * section 80 and FE-006 both require the facts to be readable by touch and
 * keyboard users. Hover only adds a restrained crop, capped at 1.02.
 */
export function ProjectCard({
  project,
  index,
  aspectRatio = 4 / 3,
  sizes = "(min-width: 1280px) 45vw, (min-width: 768px) 50vw, 100vw",
  priority = false,
  className,
}: ProjectCardProps) {
  const facts = [project.projectType, project.location, String(project.year)].filter(Boolean);

  return (
    <article className={cn("group", className)}>
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="bg-surface-sunken overflow-hidden">
          {project.heroMedia ? (
            <ImageMedia
              asset={project.heroMedia}
              aspectRatio={aspectRatio}
              sizes={sizes}
              priority={priority}
              showCaption={false}
              imageClassName="group-hover:scale-[1.02] transition-[transform,opacity] duration-(--duration-slow) ease-(--ease-out-editorial)"
            />
          ) : (
            <div style={{ aspectRatio }} aria-hidden="true" />
          )}
        </div>

        <div className="mt-5 flex items-baseline gap-4">
          {typeof index === "number" ? (
            <span className="type-meta text-foreground-subtle tabular-nums">
              {String(index).padStart(2, "0")}
            </span>
          ) : null}
          <h3 className="font-display text-2xl leading-tight tracking-tight">{project.title}</h3>
        </div>

        <p className="type-spec text-foreground-muted mt-2">{facts.join(" — ")}</p>

        <p className="type-meta text-foreground-subtle mt-2">
          {STATUS_LABEL[project.projectStatus]}
          {project.areaSqm ? ` — ${project.areaSqm} m²` : ""}
        </p>
      </Link>
    </article>
  );
}
