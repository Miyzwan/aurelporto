import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";
import type { MediaAsset } from "@/types/content";

interface MediaFrameProps {
  asset: Pick<MediaAsset, "caption" | "photographer">;
  aspectRatio: number;
  showCaption: boolean;
  className?: string;
  frameClassName?: string;
  children: ReactNode;
}

/**
 * Reserves space for a media element and, only when there is something to say,
 * wraps it in a figure with a caption.
 *
 * Space is reserved from `aspectRatio` rather than intrinsic width/height, so
 * an asset whose dimensions were never probed still causes zero layout shift.
 * A caption never substitutes for alt text (PRD section 80).
 */
export function MediaFrame({
  asset,
  aspectRatio,
  showCaption,
  className,
  frameClassName,
  children,
}: MediaFrameProps) {
  const caption = asset.caption?.trim();
  const photographer = asset.photographer?.trim();
  const hasCaption = showCaption && Boolean(caption ?? photographer);

  const frame = (
    <div
      className={cn("bg-surface-sunken relative w-full overflow-hidden", frameClassName)}
      style={{ aspectRatio }}
    >
      {children}
    </div>
  );

  if (!hasCaption) {
    return <div className={className}>{frame}</div>;
  }

  return (
    <figure className={className}>
      {frame}
      <figcaption className="type-spec text-foreground-muted mt-3 flex flex-wrap gap-x-3">
        {caption ? <span>{caption}</span> : null}
        {photographer ? (
          <span className="text-foreground-subtle">Photography: {photographer}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
