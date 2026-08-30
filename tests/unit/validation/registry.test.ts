import { describe, expect, it } from "vitest";

import { PROJECT_SECTION_REGISTRY } from "@/lib/content/project-section-registry";
import { SECTION_REGISTRY } from "@/lib/content/section-registry";
import { ContentValidationError } from "@/lib/validation/errors";
import { parsePageSectionContent } from "@/lib/validation/page-sections";
import { parseProjectSectionContent } from "@/lib/validation/project-sections";
import { PAGE_SECTION_TYPES } from "@/types/content";
import { PROJECT_SECTION_TYPES } from "@/types/project-sections";

const HERO_MEDIA_ID = "00000000-0000-0000-0000-000000000101";

describe("content registries", () => {
  it("cover every closed page and project section type", () => {
    expect(Object.keys(SECTION_REGISTRY).sort()).toEqual([...PAGE_SECTION_TYPES].sort());
    expect(Object.keys(PROJECT_SECTION_REGISTRY).sort()).toEqual([...PROJECT_SECTION_TYPES].sort());
  });

  it("parses page JSON through the section discriminator", () => {
    const content = parsePageSectionContent(
      "home_hero",
      {
        eyebrow: "Interior design",
        headline: "A considered space.",
        subheadline: "",
        location: "",
        heroMediaId: HERO_MEDIA_ID,
        signatureProjectId: null,
        primaryCtaLabel: "Projects",
        primaryCtaHref: "/projects",
        secondaryCtaLabel: "About",
        secondaryCtaHref: "/about",
      },
      "page-section-id",
    );

    expect(content).toMatchObject({ headline: "A considered space." });
  });

  it("identifies the database record when page JSON is invalid", () => {
    expect(() =>
      parsePageSectionContent("home_hero", { headline: 42 }, "bad-page-section-id"),
    ).toThrow(ContentValidationError);

    try {
      parsePageSectionContent("home_hero", { headline: 42 }, "bad-page-section-id");
    } catch (error) {
      expect(error).toBeInstanceOf(ContentValidationError);
      expect((error as ContentValidationError).recordId).toBe("bad-page-section-id");
      expect((error as Error).message).toContain("bad-page-section-id");
    }
  });

  it("rejects unknown project section types and invalid project JSON", () => {
    expect(() => parseProjectSectionContent("unknown", {}, "unknown-project-section-id")).toThrow(
      ContentValidationError,
    );
    expect(() =>
      parseProjectSectionContent(
        "plan_sequence",
        { items: [{ type: "invalid" }] },
        "bad-project-section-id",
      ),
    ).toThrow(ContentValidationError);
  });
});
