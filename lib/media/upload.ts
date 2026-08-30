export const PORTFOLIO_PUBLIC_BUCKET = "portfolio-public" as const;

export const MAX_MEDIA_FILE_SIZE_BYTES = 80 * 1024 * 1024;

export const ALLOWED_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
] as const;

export type AllowedMediaMimeType = (typeof ALLOWED_MEDIA_MIME_TYPES)[number];

const allowedMediaMimeTypes = new Set<string>(ALLOWED_MEDIA_MIME_TYPES);

export function mediaTypeForMime(mimeType: string): "image" | "video" | null {
  if (!allowedMediaMimeTypes.has(mimeType)) return null;
  return mimeType.startsWith("video/") ? "video" : "image";
}

export function validateMediaFile(file: Pick<File, "name" | "size" | "type">): string | null {
  if (!mediaTypeForMime(file.type)) {
    return "Use a JPEG, PNG, WebP, AVIF, MP4, or WebM file.";
  }

  if (file.size <= 0) return "The selected file is empty.";

  if (file.size > MAX_MEDIA_FILE_SIZE_BYTES) {
    return "Media files must be 80 MB or smaller.";
  }

  return null;
}

/**
 * Keeps the user-provided filename useful for humans while matching the
 * Storage policy's lowercase path segment. The UUID is added separately so
 * duplicate filenames never overwrite each other.
 */
export function sanitizeMediaFilename(fileName: string): string {
  const basename = fileName.split(/[\\/]/).pop() || "asset";
  const normalized = basename.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const sanitized = normalized
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^[^a-z0-9]+/, "")
    .replace(/[^a-z0-9]+$/, "")
    .replace(/-+\./g, ".")
    .slice(0, 160);

  return sanitized || "asset";
}

export function createMediaStoragePath(fileName: string, date = new Date()): string {
  const year = date.getUTCFullYear();
  const id = crypto.randomUUID().toLowerCase();
  return `portfolio/${year}/${id}-${sanitizeMediaFilename(fileName)}`;
}

export interface MediaDimensions {
  width: number;
  height: number;
}

/** Best-effort probing; metadata remains valid when a browser cannot decode it. */
export async function readMediaDimensions(file: File): Promise<MediaDimensions | null> {
  if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return null;

  const objectUrl = URL.createObjectURL(file);

  try {
    if (file.type.startsWith("image/")) {
      return await new Promise<MediaDimensions | null>((resolve) => {
        const image = new Image();
        image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
        image.onerror = () => resolve(null);
        image.src = objectUrl;
      });
    }

    return await new Promise<MediaDimensions | null>((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () =>
        resolve({ width: video.videoWidth, height: video.videoHeight });
      video.onerror = () => resolve(null);
      video.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
