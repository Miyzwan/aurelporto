import { Section } from "@/components/public/Section";
import type { PositioningContent } from "@/types/content";

interface PositioningProps {
  content: PositioningContent;
}

/**
 * A statement, not a paragraph. Each line is its own element so FE-010 can run
 * a line-by-line masked reveal without splitting text at runtime.
 */
export function Positioning({ content }: PositioningProps) {
  const lines = content.lines.map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return null;

  const body = content.body.trim();

  return (
    <Section eyebrow={content.eyebrow}>
      <div className="grid-editorial">
        <div className="desktop:col-span-9 col-span-12">
          <p className="type-heading">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>
        {body ? (
          <div className="desktop:col-span-3 desktop:mt-0 col-span-12 mt-8">
            <p className="type-body text-foreground-muted">{body}</p>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
