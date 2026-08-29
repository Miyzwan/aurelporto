"use client";

import { useState } from "react";

import { MediaFrame } from "@/components/public/MediaFrame";
import { intrinsicAspectRatio, mediaPosterUrl, mediaUrl } from "@/lib/media/urls";
import { cn } from "@/lib/utils/cn";
import type { MediaAsset } from "@/types/content";

export interface VideoMediaProps {
  asset: MediaAsset;
  aspectRatio?: number;
  /**
   * Ambient clips loop silently and hide their controls. Opt in explicitly —
   * PRD section 7 rules out autoplaying large video across every section, and
   * an ambient clip must never carry information the visitor cannot pause.
   */
  ambient?: boolean;
  showCaption?: boolean;
  className?: string;
  frameClassName?: string;
}

const FALLBACK_ASPECT_RATIO = 16 / 9;

export function VideoMedia({
  asset,
  aspectRatio,
  ambient = false,
  showCaption = true,
  className,
  frameClassName,
}: VideoMediaProps) {
  const [hasError, setHasError] = useState(false);
  const ratio = aspectRatio ?? intrinsicAspectRatio(asset) ?? FALLBACK_ASPECT_RATIO;
  const poster = mediaPosterUrl(asset);

  return (
    <MediaFrame
      asset={asset}
      aspectRatio={ratio}
      showCaption={showCaption}
      className={className}
      frameClassName={frameClassName}
    >
      {hasError ? (
        <div className="absolute inset-0 flex items-end p-4">
          <span className="type-meta text-foreground-subtle">Video unavailable</span>
        </div>
      ) : (
        <video
          // `preload="metadata"` keeps the poster and duration cheap; a mobile
          // visitor never downloads the clip unless they ask for it.
          preload="metadata"
          poster={poster}
          playsInline
          controls={!ambient}
          autoPlay={ambient}
          muted={ambient}
          loop={ambient}
          aria-label={asset.altText}
          onError={() => setHasError(true)}
          className={cn("absolute inset-0 h-full w-full object-cover")}
        >
          <source src={mediaUrl(asset)} type={asset.mimeType} />
          {/* Text fallback for a browser that cannot play the source at all. */}
          {asset.altText}
        </video>
      )}
    </MediaFrame>
  );
}
