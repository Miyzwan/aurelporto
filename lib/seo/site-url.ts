import { storagePublicUrl } from "@/lib/media/urls";
import type { MediaAsset } from "@/types/content";

/**
 * Returns the normalized base URL for the portfolio site.
 * Defaults to process.env.NEXT_PUBLIC_SITE_URL or standard local address.
 */
export function getSiteBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

/**
 * Converts a relative path into a fully qualified absolute URL.
 */
export function absoluteUrl(path = "/"): string {
  const base = getSiteBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

/**
 * Resolves a media asset or raw storage path into a fully qualified absolute URL.
 * Ideal for openGraph / twitter card images and JSON-LD schema metadata.
 */
export function resolveAbsoluteMediaUrl(
  mediaOrPath: MediaAsset | string | null | undefined,
): string | undefined {
  if (!mediaOrPath) return undefined;

  if (typeof mediaOrPath === "string") {
    if (mediaOrPath.startsWith("http://") || mediaOrPath.startsWith("https://")) {
      return mediaOrPath;
    }
    if (mediaOrPath.startsWith("/")) {
      return absoluteUrl(mediaOrPath);
    }
    // Storage path in portfolio-public
    try {
      const publicUrl = storagePublicUrl("portfolio-public", mediaOrPath);
      return resolveAbsoluteMediaUrl(publicUrl);
    } catch {
      return undefined;
    }
  }

  try {
    const publicUrl = storagePublicUrl(mediaOrPath.bucket, mediaOrPath.storagePath);
    if (publicUrl.startsWith("http://") || publicUrl.startsWith("https://")) {
      return publicUrl;
    }
    return absoluteUrl(publicUrl);
  } catch {
    return undefined;
  }
}
