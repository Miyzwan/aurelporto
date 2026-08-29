import Link from "next/link";

import { Section } from "@/components/public/Section";
import type { ProcessPreviewContent, ProcessStep } from "@/types/content";

interface ProcessPreviewProps {
  content: ProcessPreviewContent;
  steps: ProcessStep[];
}

export function ProcessPreview({ content, steps }: ProcessPreviewProps) {
  const visible = [...steps]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.stepNo - b.stepNo)
    .slice(0, Math.max(content.maxItems, 0));
  if (visible.length === 0) return null;

  const intro = content.intro.trim();

  return (
    <Section eyebrow={content.title}>
      {intro ? (
        <p className="type-body text-foreground-muted container-reading mb-12">{intro}</p>
      ) : null}

      <ol className="grid-editorial">
        {visible.map((step) => (
          <li
            key={step.id}
            className="rule-hairline tablet:col-span-6 desktop:col-span-3 col-span-12 pt-5"
          >
            <span className="type-meta text-foreground-subtle tabular-nums">
              {String(step.stepNo).padStart(2, "0")}
            </span>
            <h3 className="font-display mt-3 text-xl tracking-tight">{step.title}</h3>
            <p className="type-spec text-foreground-muted mt-2">{step.description}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12">
        <Link href="/process" className="type-meta underline underline-offset-8">
          Full process
        </Link>
      </div>
    </Section>
  );
}
