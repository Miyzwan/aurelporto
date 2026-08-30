import { VelocityStrip } from "@/components/motion";
import { Media } from "@/components/public/Media";
import { Section } from "@/components/public/Section";
import type { MaterialMomentContent, MediaAsset } from "@/types/content";

interface MaterialMomentProps {
  content: MaterialMomentContent;
  media: MediaAsset[];
}

/**
 * Renders nothing at all when the designer has not attached material imagery.
 * The section is a visual pause; an empty one would read as a mistake.
 */
export function MaterialMoment({ content, media }: MaterialMomentProps) {
  if (media.length === 0) return null;

  const intro = content.intro.trim();

  return (
    <Section eyebrow={content.title} className="bg-surface" tight>
      {intro ? (
        <p className="type-body text-foreground-muted container-reading mb-12">{intro}</p>
      ) : null}

      <VelocityStrip
        className="overflow-visible md:overflow-hidden"
        contentClassName="grid w-full grid-cols-2 gap-x-(--spacing-gutter) gap-y-(--spacing-gutter) md:flex md:w-max"
      >
        {media.map((asset, index) => (
          <div
            key={asset.id}
            className={
              index === 0
                ? "col-span-2 md:w-[38vw] md:shrink-0"
                : "col-span-1 md:w-[24vw] md:shrink-0"
            }
          >
            <Media
              asset={asset}
              aspectRatio={1}
              sizes="(min-width: 1280px) 38vw, (min-width: 768px) 38vw, 50vw"
            />
          </div>
        ))}
      </VelocityStrip>
    </Section>
  );
}
