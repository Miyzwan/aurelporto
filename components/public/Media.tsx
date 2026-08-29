import { ImageMedia } from "@/components/public/ImageMedia";
import { VideoMedia } from "@/components/public/VideoMedia";
import type { MediaAsset } from "@/types/content";

interface MediaProps {
  asset: MediaAsset;
  aspectRatio?: number;
  sizes?: string;
  priority?: boolean;
  ambient?: boolean;
  showCaption?: boolean;
  className?: string;
  frameClassName?: string;
}

/**
 * Dispatches on `mediaType` so section renderers can accept "a media asset"
 * without branching on image versus video at every call site.
 */
export function Media({ asset, sizes, priority, ambient, ...rest }: MediaProps) {
  if (asset.mediaType === "video") {
    return <VideoMedia asset={asset} ambient={ambient} {...rest} />;
  }

  return <ImageMedia asset={asset} sizes={sizes} priority={priority} {...rest} />;
}
