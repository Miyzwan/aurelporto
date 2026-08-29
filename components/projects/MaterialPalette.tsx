import { Media } from "@/components/public/Media";
import { Section } from "@/components/public/Section";
import type { MediaAsset } from "@/types/content";
import type { MaterialItem } from "@/types/project-sections";

interface MaterialPaletteProps {
  title: string | null;
  intro: string;
  items: MaterialItem[];
  media: Record<string, MediaAsset>;
}

export function MaterialPalette({ title, intro, items, media }: MaterialPaletteProps) {
  const entries = items.filter((item) => item.name.trim() || media[item.mediaId]);
  if (entries.length === 0) return null;

  return (
    <Section eyebrow={title ?? "Material palette"} className="bg-surface" tight>
      {intro.trim() ? <p className="type-body container-reading mb-12">{intro}</p> : null}

      <dl className="grid-editorial">
        {entries.map((item, index) => {
          const asset = media[item.mediaId];
          return (
            <div
              key={`${item.name}-${index}`}
              className="tablet:col-span-6 desktop:col-span-3 col-span-6"
            >
              {asset ? (
                <Media
                  asset={asset}
                  aspectRatio={1}
                  sizes="(min-width: 1280px) 22vw, (min-width: 768px) 45vw, 45vw"
                  showCaption={false}
                />
              ) : null}
              <dt className="type-spec mt-4">{item.name}</dt>
              {item.application.trim() ? (
                <dd className="type-meta text-foreground-subtle mt-1">{item.application}</dd>
              ) : null}
              {item.description.trim() ? (
                <dd className="type-spec text-foreground-muted mt-2">{item.description}</dd>
              ) : null}
            </div>
          );
        })}
      </dl>
    </Section>
  );
}
