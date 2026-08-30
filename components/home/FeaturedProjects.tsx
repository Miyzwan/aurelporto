import Link from "next/link";

import { MaskReveal } from "@/components/motion";
import { ProjectCard } from "@/components/public/ProjectCard";
import { Section } from "@/components/public/Section";
import { cn } from "@/lib/utils/cn";
import type { FeaturedProjectsContent, ProjectSummary } from "@/types/content";

interface FeaturedProjectsProps {
  content: FeaturedProjectsContent;
  projects: ProjectSummary[];
}

/**
 * Alternating editorial layout rather than a horizontal scroll track. PRD
 * section 19 offers both and prefers this one when the photography is strong:
 * it gives each interior a full column, needs no pinning, and degrades to a
 * plain vertical read on mobile with no changes.
 */
export function FeaturedProjects({ content, projects }: FeaturedProjectsProps) {
  const visible = projects.slice(0, Math.max(content.maxItems, 0));
  if (visible.length === 0) return null;

  const intro = content.intro.trim();

  return (
    <Section eyebrow={content.title}>
      {intro ? (
        <p className="type-body text-foreground-muted container-reading mb-16">{intro}</p>
      ) : null}

      <div className="flex flex-col gap-(--spacing-section-tight)">
        {visible.map((project, index) => (
          <div key={project.id} className="grid-editorial items-end">
            <ProjectCard
              className={cn(
                "col-span-12",
                index % 2 === 0
                  ? "desktop:col-span-7 desktop:col-start-1"
                  : "desktop:col-span-5 desktop:col-start-8",
              )}
              project={project}
              index={index + 1}
              aspectRatio={index % 2 === 0 ? 4 / 3 : 3 / 4}
              sizes="(min-width: 1280px) 58vw, (min-width: 768px) 70vw, 100vw"
              imageReveal
            />
            <MaskReveal
              as="div"
              className={cn(
                "type-body text-foreground-muted desktop:mt-0 col-span-12 mt-6",
                index % 2 === 0
                  ? "desktop:col-span-4 desktop:col-start-9"
                  : "desktop:col-span-5 desktop:col-start-1 desktop:row-start-1",
              )}
              contentClassName="block"
              delay={index * 0.08 + 0.12}
            >
              {project.summary}
            </MaskReveal>
          </div>
        ))}
      </div>

      <div className="rule-hairline mt-(--spacing-section-tight) pt-6">
        <Link href="/projects" className="type-meta underline underline-offset-8">
          All projects
        </Link>
      </div>
    </Section>
  );
}
