import { beforeEach, describe, expect, it } from "vitest";

import {
  DEFAULT_MEDIA_SIZES,
  intrinsicAspectRatio,
  mediaPosterUrl,
  mediaUrl,
  storagePublicUrl,
} from "@/lib/media/urls";
import { resolveAbsoluteMediaUrl } from "@/lib/seo/site-url";
import type { MediaAsset } from "@/types/content";

const sampleMedia: MediaAsset = {
  id: "00000000-0000-4000-8000-000000000001",
  bucket: "portfolio-public",
  storagePath: "portfolio/2026/00000000-0000-4000-8000-000000000001-hero.jpg",
  mediaType: "video",
  altText: "Hero space video",
  caption: null,
  photographer: null,
  width: 1920,
  height: 1080,
  posterPath: "portfolio/2026/00000000-0000-4000-8000-000000000001-poster.jpg",
  mimeType: "video/mp4",
};

describe("Media URL and helper functions (INT-016)", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SITE_URL = "https://gabrielleaurelia.com";
  });

  describe("storagePublicUrl", () => {
    it("returns pre-resolved URLs verbatim (http, https, root-relative)", () => {
      expect(storagePublicUrl("portfolio-public", "https://example.com/image.jpg")).toBe(
        "https://example.com/image.jpg",
      );
      expect(storagePublicUrl("portfolio-public", "http://example.com/image.jpg")).toBe(
        "http://example.com/image.jpg",
      );
      expect(storagePublicUrl("portfolio-public", "/fixtures/living.jpg")).toBe(
        "/fixtures/living.jpg",
      );
    });

    it("constructs standard Supabase storage URL for storage keys", () => {
      const url = storagePublicUrl(
        "portfolio-public",
        "portfolio/2026/00000000-0000-4000-8000-000000000001-hero.jpg",
      );
      expect(url).toBe(
        "https://test.supabase.co/storage/v1/object/public/portfolio-public/portfolio/2026/00000000-0000-4000-8000-000000000001-hero.jpg",
      );
    });

    it("throws a descriptive error when NEXT_PUBLIC_SUPABASE_URL is missing and key is not pre-resolved", () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      expect(() => storagePublicUrl("portfolio-public", "portfolio/2026/test.jpg")).toThrow(
        "NEXT_PUBLIC_SUPABASE_URL is not set",
      );
    });
  });

  describe("mediaUrl and mediaPosterUrl", () => {
    it("resolves primary media URL", () => {
      const url = mediaUrl(sampleMedia);
      expect(url).toContain("https://test.supabase.co/storage/v1/object/public/portfolio-public/");
    });

    it("resolves poster URL when posterPath is present", () => {
      const poster = mediaPosterUrl(sampleMedia);
      expect(poster).toContain("-poster.jpg");
    });

    it("returns undefined when posterPath is null or missing", () => {
      expect(mediaPosterUrl({ bucket: "portfolio-public", posterPath: null })).toBeUndefined();
    });
  });

  describe("intrinsicAspectRatio", () => {
    it("calculates aspect ratio when width and height are non-zero", () => {
      expect(intrinsicAspectRatio({ width: 1920, height: 1080 })).toBeCloseTo(1.777, 2);
      expect(intrinsicAspectRatio({ width: 800, height: 800 })).toBe(1);
    });

    it("returns undefined when width or height is zero or null", () => {
      expect(intrinsicAspectRatio({ width: null, height: 1080 })).toBeUndefined();
      expect(intrinsicAspectRatio({ width: 1920, height: null })).toBeUndefined();
      expect(intrinsicAspectRatio({ width: 1920, height: 0 })).toBeUndefined();
    });
  });

  describe("DEFAULT_MEDIA_SIZES", () => {
    it("exports standard responsive sizes string", () => {
      expect(DEFAULT_MEDIA_SIZES).toBe(
        "(min-width: 1280px) 100vw, (min-width: 768px) 100vw, 100vw",
      );
    });
  });

  describe("resolveAbsoluteMediaUrl", () => {
    it("resolves full absolute URL for OpenGraph and structured data", () => {
      const absUrl = resolveAbsoluteMediaUrl(sampleMedia);
      expect(absUrl?.startsWith("https://")).toBe(true);

      const fixtureUrl = resolveAbsoluteMediaUrl("/fixtures/plan.svg");
      expect(fixtureUrl).toBe("https://gabrielleaurelia.com/fixtures/plan.svg");
    });

    it("handles null/undefined media safely", () => {
      expect(resolveAbsoluteMediaUrl(null)).toBeUndefined();
      expect(resolveAbsoluteMediaUrl(undefined)).toBeUndefined();
    });
  });
});
