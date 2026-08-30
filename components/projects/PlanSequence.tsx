"use client";

import { useGSAP } from "@gsap/react";
import { Media } from "@/components/public/Media";
import { Section } from "@/components/public/Section";
import { useReducedMotion } from "motion/react";
import { useRef } from "react";

import { gsap } from "@/lib/gsap";
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
 * FE-011 adds a short desktop pin and scrub. The static markup below is what
 * remains when motion is off, reduced, or unsupported, so each drawing must be
 * individually legible and labelled here — not only inside the animation.
 */
export function PlanSequence({ title, intro, items, media }: PlanSequenceProps) {
  const sequenceRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const steps = items
    .map((item) => ({ item, asset: media[item.mediaId] }))
    .filter((step): step is { item: PlanSequenceItem; asset: MediaAsset } => Boolean(step.asset));

  useGSAP(
    () => {
      if (shouldReduceMotion || steps.length < 2) return;

      const root = sequenceRef.current;
      if (!root) return;

      const stepElements = Array.from(
        root.querySelectorAll<HTMLElement>("[data-plan-sequence-step]"),
      );
      if (stepElements.length < 2) return;

      const media = gsap.matchMedia();
      media.add("(min-width: 1280px)", () => {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            pin: true,
            start: "top top+=96",
            end: `+=${Math.min(420, 180 + stepElements.length * 72)}`,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        stepElements.forEach((step, index) => {
          timeline.to(
            step,
            {
              yPercent: index % 2 === 0 ? -2 : 2,
              scale: 0.985,
              duration: 1,
              ease: "none",
            },
            index,
          );
        });
      });

      return () => media.revert();
    },
    {
      dependencies: [shouldReduceMotion, steps.length],
      revertOnUpdate: true,
      scope: sequenceRef,
    },
  );

  if (steps.length === 0) return null;

  return (
    <Section eyebrow={title ?? "Spatial planning"} tight>
      {intro.trim() ? <p className="type-body container-reading mb-12">{intro}</p> : null}

      <div ref={sequenceRef} className="relative" data-motion="plan-sequence">
        <ol className="grid-editorial">
          {steps.map(({ item, asset }, index) => (
            <li
              key={`${item.mediaId}-${index}`}
              className="tablet:col-span-6 col-span-12"
              data-plan-sequence-step
            >
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
      </div>
    </Section>
  );
}
