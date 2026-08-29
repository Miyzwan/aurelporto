"use client";

import { useId, useState } from "react";

import { Media } from "@/components/public/Media";
import type { MediaAsset } from "@/types/content";
import type { BeforeAfterPair } from "@/types/project-sections";

interface BeforeAfterProps {
  pairs: BeforeAfterPair[];
  media: Record<string, MediaAsset>;
}

/**
 * Before/after comparison.
 *
 * PRD section 80 forbids making this drag-only, so the primary control is a
 * pair of radio-style buttons: keyboard reachable, touch reachable, and
 * announced. Each state is explicitly labelled "Before" or "After" — a slider
 * handle alone does not tell a screen-reader user which image they are on.
 * FE-011 may add a scrub on top; it must not replace this.
 */
function BeforeAfterPairView({
  pair,
  media,
}: {
  pair: BeforeAfterPair;
  media: Record<string, MediaAsset>;
}) {
  const [showing, setShowing] = useState<"before" | "after">("after");
  const regionId = useId();

  const before = media[pair.beforeMediaId];
  const after = media[pair.afterMediaId];
  if (!before || !after) return null;

  const asset = showing === "before" ? before : after;

  return (
    <figure>
      <div id={regionId} aria-live="polite">
        <Media
          asset={asset}
          aspectRatio={3 / 2}
          sizes="(min-width: 768px) 100vw, 100vw"
          showCaption={false}
        />
      </div>

      <figcaption className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        {pair.label.trim() ? <span className="type-spec">{pair.label}</span> : null}
        <div role="group" aria-label="Compare before and after" className="-mx-2 flex">
          {(["before", "after"] as const).map((state) => (
            <button
              key={state}
              type="button"
              aria-pressed={showing === state}
              aria-controls={regionId}
              onClick={() => setShowing(state)}
              className={
                showing === state
                  ? "type-meta px-2 py-2 underline underline-offset-8"
                  : "type-meta text-foreground-subtle hover:text-foreground px-2 py-2"
              }
            >
              {state === "before" ? "Before" : "After"}
            </button>
          ))}
        </div>
      </figcaption>
    </figure>
  );
}

export function BeforeAfter({ pairs, media }: BeforeAfterProps) {
  const usable = pairs.filter((pair) => media[pair.beforeMediaId] && media[pair.afterMediaId]);
  if (usable.length === 0) return null;

  return (
    <div className="flex flex-col gap-(--spacing-section-tight)">
      {usable.map((pair, index) => (
        <BeforeAfterPairView key={`${pair.label}-${index}`} pair={pair} media={media} />
      ))}
    </div>
  );
}
