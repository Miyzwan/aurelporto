import type { MediaAsset } from "@/types/content";

/**
 * True when a stored path is already a resolvable URL and must be used
 * verbatim: an absolute URL, or a root-relative path served from /public.
 *
 * This is what lets the static frontend tasks (FE-004..FE-008) run against
 * local fixtures before Supabase Storage exists, without a second code path.
 */
function isResolvedPath(path: string): boolean {
  return path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/");
}

/**
 * Public URL for an object in a public Supabase Storage bucket.
 *
 * Only `portfolio-public` is public by design (master plan constraint 21–22).
 * Never route a private bucket through this helper.
 */
export function storagePublicUrl(bucket: string, storagePath: string): string {
  if (isResolvedPath(storagePath)) return storagePath;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not set — cannot resolve a Supabase Storage path. " +
        "Set it in .env.local, or use a /public fixture path during static frontend work.",
    );
  }

  const base = supabaseUrl.replace(/\/+$/, "");
  const path = storagePath.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function mediaUrl(asset: Pick<MediaAsset, "bucket" | "storagePath">): string {
  return storagePublicUrl(asset.bucket, asset.storagePath);
}

/** Poster frame for a video asset, when the uploader captured one. */
export function mediaPosterUrl(
  asset: Pick<MediaAsset, "bucket" | "posterPath">,
): string | undefined {
  return asset.posterPath ? storagePublicUrl(asset.bucket, asset.posterPath) : undefined;
}

/**
 * Intrinsic aspect ratio when both dimensions are known, otherwise undefined so
 * the caller can fall back to a layout-declared ratio.
 */
export function intrinsicAspectRatio(
  asset: Pick<MediaAsset, "width" | "height">,
): number | undefined {
  if (!asset.width || !asset.height || asset.height === 0) return undefined;
  return asset.width / asset.height;
}

/**
 * Default responsive `sizes`. A full-bleed interior render on desktop is the
 * common case; anything narrower should pass its own value so the browser does
 * not download a 2560px source for a 400px column.
 */
export const DEFAULT_MEDIA_SIZES = "(min-width: 1280px) 100vw, (min-width: 768px) 100vw, 100vw";
