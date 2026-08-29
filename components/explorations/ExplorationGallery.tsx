import { Media } from "@/components/public/Media";
import type { ExplorationSummary } from "@/types/content";

interface ExplorationGalleryProps {
  explorations: ExplorationSummary[];
}

export function ExplorationGallery({ explorations }: ExplorationGalleryProps) {
  if (explorations.length === 0) {
    return (
      <div className="rule-hairline py-16">
        <p className="type-body text-foreground-muted">
          Studies and experiments will be published here.
        </p>
      </div>
    );
  }

  const ordered = [...explorations].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="tablet:columns-2 desktop:columns-3 columns-1 gap-x-(--spacing-gutter)">
      {ordered.map((exploration) => (
        <article key={exploration.id} className="mb-(--spacing-section-tight) break-inside-avoid">
          {exploration.coverMedia ? (
            <Media
              asset={exploration.coverMedia}
              aspectRatio={4 / 5}
              sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw"
              showCaption={false}
            />
          ) : null}
          <h2 className="font-display mt-4 text-xl tracking-tight">{exploration.title}</h2>
          <p className="type-meta text-foreground-subtle mt-2">
            {[exploration.category, exploration.year].filter(Boolean).join(" — ")}
          </p>
          {exploration.description ? (
            <p className="type-spec text-foreground-muted mt-2">{exploration.description}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
