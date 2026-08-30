"use client";

import { motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { useId, useRef, useState, type KeyboardEvent } from "react";

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
  const [showing, setShowing] = useState<"before" | "after" | null>("after");
  const regionId = useId();
  const sliderRef = useRef<HTMLInputElement>(null);
  const position = useMotionValue(100);
  const afterClipPath = useTransform(position, (value) => {
    const clamped = Math.min(Math.max(value, 0), 100);
    return `inset(0 0 0 ${100 - clamped}%)`;
  });
  const handlePosition = useTransform(position, (value) => `${Math.min(Math.max(value, 0), 100)}%`);

  const before = media[pair.beforeMediaId];
  const after = media[pair.afterMediaId];
  useMotionValueEvent(position, "change", (value) => {
    const nextShowing = value <= 0 ? "before" : value >= 100 ? "after" : null;
    setShowing((current) => (current === nextShowing ? current : nextShowing));
  });

  if (!before || !after) return null;

  const setPosition = (value: number) => {
    position.set(value);
    if (sliderRef.current) sliderRef.current.value = String(value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const current = Number(event.currentTarget.value);
    const next =
      event.key === "ArrowRight" || event.key === "ArrowUp"
        ? Math.min(current + 1, 100)
        : event.key === "ArrowLeft" || event.key === "ArrowDown"
          ? Math.max(current - 1, 0)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? 100
              : null;

    if (next === null || next === current) return;

    event.preventDefault();
    setPosition(next);
  };

  return (
    <figure>
      <div
        id={regionId}
        className="focus-within:outline-focus relative focus-within:outline-2 focus-within:outline-offset-2"
        aria-label="Before and after image comparison"
        data-before-after-frame
      >
        <div aria-hidden="true">
          <Media
            asset={before}
            aspectRatio={3 / 2}
            sizes="(min-width: 768px) 100vw, 100vw"
            showCaption={false}
          />
        </div>

        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          style={{ clipPath: afterClipPath }}
          aria-hidden="true"
        >
          <Media
            asset={after}
            aspectRatio={3 / 2}
            sizes="(min-width: 768px) 100vw, 100vw"
            showCaption={false}
          />
        </motion.div>

        <motion.div
          className="bg-warm-white/90 pointer-events-none absolute inset-y-0 z-10 w-px"
          style={{ left: handlePosition }}
          aria-hidden="true"
        />

        <input
          ref={sliderRef}
          type="range"
          min="0"
          max="100"
          step="1"
          defaultValue="100"
          aria-label="Adjust before and after comparison"
          aria-valuetext={
            showing === "before" ? "Before" : showing === "after" ? "After" : "Partial comparison"
          }
          aria-controls={regionId}
          data-before-after-input
          onKeyDown={handleKeyDown}
          onChange={(event) => position.set(Number(event.currentTarget.value))}
          className="absolute inset-0 z-20 h-full w-full cursor-ew-resize [touch-action:pan-y] opacity-0"
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
              onClick={() => setPosition(state === "before" ? 0 : 100)}
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
        <span className="sr-only" aria-live="polite">
          Showing{" "}
          {showing === "before" ? "before" : showing === "after" ? "after" : "partial comparison"}{" "}
          view.
        </span>
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
