import { Media } from "@/components/public/Media";
import type { ProcessStep } from "@/types/content";

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const ordered = [...steps].sort((a, b) => a.sortOrder - b.sortOrder || a.stepNo - b.stepNo);
  if (ordered.length === 0) {
    return <p className="type-body text-foreground-muted">The process is being written up.</p>;
  }

  return (
    <ol className="border-line flex flex-col border-t">
      {ordered.map((step) => (
        <li key={step.id} className="border-line grid-editorial border-b py-12">
          <div className="desktop:col-span-2 col-span-12">
            <span className="type-meta text-foreground-subtle tabular-nums">
              {String(step.stepNo).padStart(2, "0")}
            </span>
          </div>
          <div className="desktop:col-span-4 desktop:mt-0 col-span-12 mt-3">
            <h2 className="font-display text-2xl tracking-tight">{step.title}</h2>
          </div>
          <div className="desktop:col-span-5 desktop:col-start-8 desktop:mt-0 col-span-12 mt-3">
            <p className="type-body text-foreground-muted">{step.description}</p>
            {step.media ? (
              <div className="mt-8">
                <Media
                  asset={step.media}
                  aspectRatio={4 / 3}
                  sizes="(min-width: 1280px) 40vw, 100vw"
                />
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
