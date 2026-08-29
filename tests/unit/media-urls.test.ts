import { describe, expect, it } from "vitest";

import { intrinsicAspectRatio, mediaPosterUrl, storagePublicUrl } from "@/lib/media/urls";

describe("storagePublicUrl", () => {
  it("passes through an already-resolved path", () => {
    expect(storagePublicUrl("portfolio-public", "/fixtures/a.jpg")).toBe("/fixtures/a.jpg");
    expect(storagePublicUrl("portfolio-public", "https://cdn.test/a.jpg")).toBe(
      "https://cdn.test/a.jpg",
    );
  });

  it("throws a directive error when the Supabase URL is missing", () => {
    expect(() => storagePublicUrl("portfolio-public", "projects/a.jpg")).toThrow(
      /NEXT_PUBLIC_SUPABASE_URL/,
    );
  });
});

describe("intrinsicAspectRatio", () => {
  it("returns undefined when either dimension is missing or zero", () => {
    expect(intrinsicAspectRatio({ width: null, height: 100 })).toBeUndefined();
    expect(intrinsicAspectRatio({ width: 100, height: null })).toBeUndefined();
    expect(intrinsicAspectRatio({ width: 100, height: 0 })).toBeUndefined();
  });

  it("divides width by height", () => {
    expect(intrinsicAspectRatio({ width: 1600, height: 900 })).toBeCloseTo(16 / 9);
  });
});

describe("mediaPosterUrl", () => {
  it("is undefined without a poster path", () => {
    expect(mediaPosterUrl({ bucket: "portfolio-public", posterPath: null })).toBeUndefined();
  });
});
