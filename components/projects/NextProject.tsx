import Link from "next/link";

import { FullWidthPreview } from "@/components/motion";
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
      <Link href={`/projects/${project.slug}`} className="group mt-6 block">
        <div className="grid-editorial items-end">
          <h2 className="type-heading desktop:col-span-8 col-span-12">{project.title}</h2>
          <span className="type-meta text-foreground-subtle desktop:col-span-4 desktop:mt-0 col-span-12 mt-4">
            View project
          </span>
        </div>
        {project.heroMedia ? (
          <FullWidthPreview className="mt-8">
            <ImageMedia
              asset={project.heroMedia}
              aspectRatio={16 / 9}
              sizes="100vw"
              showCaption={false}
              imageClassName="transition-[transform,opacity] duration-(--duration-slow) ease-(--ease-out-editorial) group-hover:scale-[1.02]"
            />
          </FullWidthPreview>
        ) : null}
      </Link>
    </section>
  );
}
