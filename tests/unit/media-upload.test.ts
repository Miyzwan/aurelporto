import { describe, expect, it } from "vitest";

import {
  ALLOWED_MEDIA_MIME_TYPES,
  createMediaStoragePath,
  MAX_MEDIA_FILE_SIZE_BYTES,
  mediaTypeForMime,
  sanitizeMediaFilename,
  validateMediaFile,
} from "@/lib/media/upload";

describe("media upload constraints", () => {
  it("sanitizes names and creates policy-compatible UUID paths", () => {
    expect(sanitizeMediaFilename("../Oak Shelving (Final).JPG")).toBe("oak-shelving-final.jpg");

    const path = createMediaStoragePath("../Oak Shelving (Final).JPG", new Date("2026-08-30"));
    expect(path).toMatch(
      /^portfolio\/2026\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-oak-shelving-final.jpg$/,
    );
  });

  it("accepts only the Storage bucket's image/video types and size", () => {
    expect(ALLOWED_MEDIA_MIME_TYPES).toContain("image/avif");
    expect(mediaTypeForMime("video/webm")).toBe("video");
    expect(mediaTypeForMime("application/pdf")).toBeNull();
    expect(
      validateMediaFile(new File([new Uint8Array([1])], "plan.pdf", { type: "application/pdf" })),
    ).toMatch(/JPEG|PNG|WebP/);
    expect(
      validateMediaFile(
        new File([new Uint8Array(MAX_MEDIA_FILE_SIZE_BYTES + 1)], "large.jpg", {
          type: "image/jpeg",
        }),
      ),
    ).toMatch(/80 MB/);
  });
});
