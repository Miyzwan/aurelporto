import { Media } from "@/components/public/Media";
import { Section } from "@/components/public/Section";
import type { MediaAsset } from "@/types/content";
import type { PlanItemType, PlanSequenceItem } from "@/types/project-sections";

interface PlanSequenceProps {
  title: string | null;
  intro: string;
  items: PlanSequenceItem[];
  media: Record<string, MediaAsset>;
}

const PLAN_TYPE_LABEL: Record<PlanItemType, string> = {
  existing: "Existing condition",
  zoning: "Zoning",
  layout: "Layout",
  furniture: "Furniture layout",
  lighting: "Lighting",
  ceiling: "Ceiling",
  custom: "Detail",
};

/**
 * The plan-to-space sequence, laid out as a readable ordered list.
 *
 * FE-011 pins and cross-fades this on desktop. The static markup below is what
 * remains when motion is off, reduced, or unsupported, so each drawing must be
 * individually legible and labelled here — not only inside the animation.
 */
export function PlanSequence({ title, intro, items, media }: PlanSequenceProps) {
  const steps = items
    .map((item) => ({ item, asset: media[item.mediaId] }))
    .filter((step): step is { item: PlanSequenceItem; asset: MediaAsset } => Boolean(step.asset));

  if (steps.length === 0) return null;

  return (
    <Section eyebrow={title ?? "Spatial planning"} tight>
      {intro.trim() ? <p className="type-body container-reading mb-12">{intro}</p> : null}

      <ol className="grid-editorial">
        {steps.map(({ item, asset }, index) => (
          <li key={`${item.mediaId}-${index}`} className="tablet:col-span-6 col-span-12">
            <Media
              asset={asset}
              aspectRatio={4 / 3}
              sizes="(min-width: 768px) 50vw, 100vw"
              showCaption={false}
              // Drawings must be read, not cropped.
              frameClassName="bg-surface"
              imageClassName="object-contain p-4"
            />
            <p className="type-meta text-foreground-subtle mt-4">
              {PLAN_TYPE_LABEL[item.type] ?? item.type}
            </p>
            {item.title.trim() ? <h3 className="type-spec mt-1">{item.title}</h3> : null}
            {item.caption.trim() ? (
              <p className="type-spec text-foreground-muted mt-1">{item.caption}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </Section>
  );
}
