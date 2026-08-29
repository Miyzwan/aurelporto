import Link from "next/link";

import { ImageMedia } from "@/components/public/ImageMedia";
import type { ProjectSummary } from "@/types/content";

interface NextProjectProps {
  project: ProjectSummary | null;
}

export function NextProject({ project }: NextProjectProps) {
  if (!project) return null;

  return (
    <section className="border-line container-editorial border-t py-(--spacing-section-tight)">
      <p className="type-meta text-foreground-subtle">Next project</p>
      <Link href={`/projects/${project.slug}`} className="group grid-editorial mt-6 items-end">
        <h2 className="type-heading desktop:col-span-7 col-span-12">{project.title}</h2>
        {project.heroMedia ? (
          <div className="desktop:col-span-5 desktop:mt-0 col-span-12 mt-8">
            <ImageMedia
              asset={project.heroMedia}
              aspectRatio={16 / 9}
              sizes="(min-width: 1280px) 40vw, 100vw"
              showCaption={false}
              imageClassName="group-hover:scale-[1.02] transition-[transform,opacity] duration-(--duration-slow) ease-(--ease-out-editorial)"
            />
          </div>
        ) : null}
      </Link>
    </section>
  );
}
