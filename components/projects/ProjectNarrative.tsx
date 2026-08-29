import { Media } from "@/components/public/Media";
import { Section } from "@/components/public/Section";
import type { MediaAsset } from "@/types/content";

interface ProjectNarrativeProps {
  title: string | null;
  body: string;
  media: MediaAsset[];
}

/**
 * Shared renderer for every narrative section type (overview, brief,
 * challenge, concept, lighting_strategy, custom_furniture, visualization,
 * implementation, outcome, rich_text, existing_condition). They differ only in
 * their heading, so one component serves all of them.
 */
export function ProjectNarrative({ title, body, media }: ProjectNarrativeProps) {
  const text = body.trim();
  if (!text && media.length === 0) return null;

  return (
    <Section eyebrow={title} tight>
      {text ? (
        <div className="grid-editorial">
          <div className="desktop:col-span-7 col-span-12">
            {text.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="type-body mt-6 first:mt-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {media.length > 0 ? (
        <div className="grid-editorial mt-12">
          {media.map((asset, index) => (
            <Media
              key={asset.id}
              asset={asset}
              sizes={
                media.length === 1
                  ? "(min-width: 768px) 100vw, 100vw"
                  : "(min-width: 768px) 50vw, 100vw"
              }
              className={media.length === 1 ? "col-span-12" : "tablet:col-span-6 col-span-12"}
              priority={index === 0 && media.length === 1}
            />
          ))}
        </div>
      ) : null}
    </Section>
  );
}
