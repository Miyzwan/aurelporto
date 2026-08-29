import { Media } from "@/components/public/Media";
import type { MediaAsset } from "@/types/content";

interface EditorialGalleryProps {
  media: MediaAsset[];
}

/**
 * Alternating full-width and paired images so a long gallery does not read as
 * a uniform stack. Deterministic from index, so a project's gallery looks the
 * same on every visit.
 */
export function EditorialGallery({ media }: EditorialGalleryProps) {
  if (media.length === 0) return null;

  return (
    <div className="grid-editorial">
      {media.map((asset, index) => {
        const isWide = index % 3 === 0;
        return (
          <Media
            key={asset.id}
            asset={asset}
            aspectRatio={isWide ? 16 / 9 : 4 / 5}
            sizes={isWide ? "100vw" : "(min-width: 768px) 50vw, 100vw"}
            className={isWide ? "col-span-12" : "tablet:col-span-6 col-span-12"}
          />
        );
      })}
    </div>
  );
}
