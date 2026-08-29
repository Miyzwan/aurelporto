"use client";

import Image from "next/image";
import { useState } from "react";

import { MediaFrame } from "@/components/public/MediaFrame";
import { DEFAULT_MEDIA_SIZES, intrinsicAspectRatio, mediaUrl } from "@/lib/media/urls";
import { cn } from "@/lib/utils/cn";
import type { MediaAsset } from "@/types/content";

export interface ImageMediaProps {
  asset: MediaAsset;
  /** Overrides the asset's intrinsic ratio; wins so layouts stay predictable. */
  aspectRatio?: number;
  sizes?: string;
  priority?: boolean;
  showCaption?: boolean;
  className?: string;
  frameClassName?: string;
  imageClassName?: string;
}

const FALLBACK_ASPECT_RATIO = 3 / 2;

/**
 * Interior photography and drawings.
 *
 * Rendered with `fill` inside a ratio-locked frame: the frame owns the layout,
 * so a missing intrinsic width/height can never collapse the page or shift it
 * once the source loads. `next/image` serves the optimised derivative — the
 * full-resolution original is never linked directly.
 */
export function ImageMedia({
  asset,
  aspectRatio,
  sizes = DEFAULT_MEDIA_SIZES,
  priority = false,
  showCaption = true,
  className,
  frameClassName,
  imageClassName,
}: ImageMediaProps) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const ratio = aspectRatio ?? intrinsicAspectRatio(asset) ?? FALLBACK_ASPECT_RATIO;

  return (
    <MediaFrame
      asset={asset}
      aspectRatio={ratio}
      showCaption={showCaption}
      className={className}
      frameClassName={frameClassName}
    >
      {status === "error" ? (
        // Keeps the reserved space and stays announced, rather than vanishing
        // and pulling the rest of the section upwards.
        <div className="absolute inset-0 flex items-end p-4" role="img" aria-label={asset.altText}>
          <span className="type-meta text-foreground-subtle">Image unavailable</span>
        </div>
      ) : (
        <Image
          src={mediaUrl(asset)}
          alt={asset.altText}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          data-status={status}
          className={cn(
            "object-cover transition-opacity duration-(--duration-base) ease-(--ease-out-editorial)",
            status === "loaded" ? "opacity-100" : "opacity-0",
            imageClassName,
          )}
        />
      )}
    </MediaFrame>
  );
}
