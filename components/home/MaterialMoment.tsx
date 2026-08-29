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

      <div className="grid-editorial">
        {media.map((asset, index) => (
          <Media
            key={asset.id}
            asset={asset}
            aspectRatio={1}
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 90vw"
            className={
              index === 0
                ? "tablet:col-span-6 desktop:col-span-4 col-span-12"
                : "tablet:col-span-6 desktop:col-span-4 col-span-6"
            }
          />
        ))}
      </div>
    </Section>
  );
}
