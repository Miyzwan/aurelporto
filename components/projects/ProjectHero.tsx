import { Media } from "@/components/public/Media";
import type { ProjectSummary } from "@/types/content";

interface ProjectHeroProps {
  project: ProjectSummary;
}

export function ProjectHero({ project }: ProjectHeroProps) {
  return (
    <section className="container-editorial pt-(--spacing-section-tight)">
      <div className="grid-editorial">
        <div className="desktop:col-span-9 col-span-12">
          <p className="type-meta text-foreground-subtle">{project.projectType}</p>
          <h1 className="type-display mt-6">{project.title}</h1>
        </div>
      </div>

      {project.heroMedia ? (
        <div className="mt-12">
          <Media
            asset={project.heroMedia}
            aspectRatio={16 / 9}
            sizes="100vw"
            priority
            showCaption={false}
          />
        </div>
      ) : null}
    </section>
  );
}
