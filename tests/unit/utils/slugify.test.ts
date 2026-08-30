import { describe, expect, it } from "vitest";

import { slugify } from "@/lib/utils/slugify";

describe("Slugify utility (INT-016)", () => {
  it("converts simple string to kebab-case", () => {
    expect(slugify("Menteng Sanctuary")).toBe("menteng-sanctuary");
  });

  it("handles uppercase and extra whitespace", () => {
    expect(slugify("   HIGH-END RESIDENTIAL   ")).toBe("high-end-residential");
  });

  it("normalizes unicode and removes accents / diacritics", () => {
    expect(slugify("Café & Résidence")).toBe("cafe-residence");
    expect(slugify("Château d'Ivoire")).toBe("chateau-d-ivoire");
  });

  it("replaces special characters and punctuation with hyphens", () => {
    expect(slugify("Studio: Concept @ 2026 (Part 1)!")).toBe("studio-concept-2026-part-1");
    expect(slugify("Material #01 & #02")).toBe("material-01-02");
  });

  it("collapses consecutive hyphens and trims leading/trailing hyphens", () => {
    expect(slugify("---test---slug---")).toBe("test-slug");
    expect(slugify("foo   ---   bar")).toBe("foo-bar");
  });

  it("handles empty or whitespace-only strings gracefully", () => {
    expect(slugify("")).toBe("");
    expect(slugify("     ")).toBe("");
    expect(slugify("---")).toBe("");
  });

  it("preserves alphanumeric numbers accurately", () => {
    expect(slugify("Villa 404 & Apartment 102")).toBe("villa-404-apartment-102");
  });
});
