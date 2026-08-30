import { describe, expect, it } from "vitest";

import { ContentValidationError } from "@/lib/validation/errors";
import { pageSectionContentSchemas, parsePageSectionContent } from "@/lib/validation/page-sections";
import {
  projectSectionContentSchemas,
  parseProjectSectionContent,
} from "@/lib/validation/project-sections";
import { settingsSchema } from "@/lib/validation/site";
import { PAGE_SECTION_TYPES } from "@/types/content";
import { PROJECT_SECTION_TYPES } from "@/types/project-sections";

const UUID_1 = "00000000-0000-4000-8000-000000000001";
const UUID_2 = "00000000-0000-4000-8000-000000000002";

describe("Section Zod Schemas Comprehensive Coverage (INT-016)", () => {
  describe("All Page Section Schemas", () => {
    it("has registered validators for all page section types", () => {
      for (const sectionType of PAGE_SECTION_TYPES) {
        expect(pageSectionContentSchemas).toHaveProperty(sectionType);
      }
    });

    it("parses valid home_hero content", () => {
      const valid = {
        eyebrow: "Spatial Design",
        headline: "Quiet material balance.",
        subheadline: "Architectural interiors.",
        location: "Jakarta",
        heroMediaId: UUID_1,
        signatureProjectId: UUID_2,
        primaryCtaLabel: "View projects",
        primaryCtaHref: "/projects",
        secondaryCtaLabel: "Inquire",
        secondaryCtaHref: "/contact",
      };
      expect(parsePageSectionContent("home_hero", valid, "rec-1")).toEqual(valid);
    });

    it("parses valid positioning content", () => {
      const valid = {
        eyebrow: "Vision",
        lines: ["Form follows texture and restrained shadow.", "Quiet material resonance."],
        body: "Creating serene spaces that outlast trends.",
      };
      expect(parsePageSectionContent("positioning", valid, "rec-2")).toEqual(valid);
    });

    it("parses valid featured_projects content", () => {
      const valid = {
        title: "Selected Work",
        intro: "Recent case studies.",
        maxItems: 4,
      };
      expect(parsePageSectionContent("featured_projects", valid, "rec-3")).toEqual(valid);
    });

    it("parses valid philosophy content", () => {
      const valid = {
        title: "Philosophy",
        intro: "Restraint is not absence, but precision.",
        items: [{ title: "Texture", body: "Materials tell the history of touch." }],
      };
      expect(parsePageSectionContent("philosophy", valid, "rec-4")).toEqual(valid);
    });

    it("parses valid services_preview content", () => {
      const valid = {
        title: "Services",
        intro: "Interior architectural services.",
        maxItems: 3,
      };
      expect(parsePageSectionContent("services_preview", valid, "rec-5")).toEqual(valid);
    });

    it("parses valid process_preview content", () => {
      const valid = {
        title: "Our Process",
        intro: "A transparent four-stage approach.",
        maxItems: 4,
      };
      expect(parsePageSectionContent("process_preview", valid, "rec-6")).toEqual(valid);
    });

    it("parses valid material_moment content", () => {
      const valid = {
        title: "Travertine & Linen",
        intro: "Tactile material explorations.",
        mediaIds: [UUID_1, UUID_2],
      };
      expect(parsePageSectionContent("material_moment", valid, "rec-7")).toEqual(valid);
    });

    it("parses valid credibility content", () => {
      const valid = {
        title: "Testimonials",
        stats: [{ value: "10+", label: "Years Experience" }],
        testimonialIds: [UUID_1],
      };
      expect(parsePageSectionContent("credibility", valid, "rec-8")).toEqual(valid);
    });

    it("parses valid cta content", () => {
      const valid = {
        eyebrow: "Contact",
        title: "Ready to discuss your space?",
        body: "We take on a limited number of projects each year.",
        ctaLabel: "Contact Studio",
        ctaHref: "/contact",
      };
      expect(parsePageSectionContent("cta", valid, "rec-9")).toEqual(valid);
    });

    it("parses valid rich_text content", () => {
      const valid = {
        title: "Studio Background",
        body: "Founded with an ethos of architectural purity.",
      };
      expect(parsePageSectionContent("rich_text", valid, "rec-10")).toEqual(valid);
    });

    it("parses valid gallery content", () => {
      const valid = {
        title: "Explorations",
        intro: "Selected explorations",
        mediaIds: [UUID_1],
      };
      expect(parsePageSectionContent("gallery", valid, "rec-11")).toEqual(valid);
    });

    it("rejects invalid page section payloads and throws ContentValidationError with recordId", () => {
      expect(() => parsePageSectionContent("cta", { title: "" }, "bad-record-id")).toThrow(
        ContentValidationError,
      );

      try {
        parsePageSectionContent("cta", { title: "" }, "bad-record-id");
      } catch (err) {
        expect(err).toBeInstanceOf(ContentValidationError);
        expect((err as ContentValidationError).recordId).toBe("bad-record-id");
      }
    });
  });

  describe("All Project Section Schemas", () => {
    it("has registered validators for all project section types", () => {
      for (const sectionType of PROJECT_SECTION_TYPES) {
        expect(projectSectionContentSchemas).toHaveProperty(sectionType);
      }
    });

    it("parses valid concept section", () => {
      const valid = {
        body: "The design concept centers around light and shadow.",
        mediaIds: [UUID_1],
      };
      expect(parseProjectSectionContent("concept", valid, "proj-sec-1")).toEqual(valid);
    });

    it("parses valid overview narrative section", () => {
      const valid = {
        body: "Detailed spatial sequence narrative.",
        mediaIds: [UUID_1, UUID_2],
      };
      expect(parseProjectSectionContent("overview", valid, "proj-sec-2")).toEqual(valid);
    });

    it("parses valid before_after section", () => {
      const valid = {
        intro: "Transformation overview",
        pairs: [
          {
            label: "Living room",
            beforeMediaId: UUID_1,
            afterMediaId: UUID_2,
          },
        ],
      };
      expect(parseProjectSectionContent("before_after", valid, "proj-sec-4")).toEqual(valid);
    });

    it("parses valid material_palette section", () => {
      const valid = {
        intro: "Palette of raw concrete, travertine, and teak.",
        items: [
          {
            name: "Travertine",
            application: "Flooring",
            description: "Honed finish",
            mediaId: UUID_1,
          },
        ],
      };
      expect(parseProjectSectionContent("material_palette", valid, "proj-sec-5")).toEqual(valid);
    });

    it("parses valid plan_sequence section", () => {
      const valid = {
        intro: "Floor plan evolution across design phases.",
        items: [
          {
            title: "Initial Layout",
            type: "layout" as const,
            mediaId: UUID_1,
            caption: "Original 3-bedroom layout",
          },
        ],
      };
      expect(parseProjectSectionContent("plan_sequence", valid, "proj-sec-6")).toEqual(valid);
    });

    it("parses valid credits section", () => {
      const valid = {
        items: [
          { role: "Architect", name: "Studio XYZ", url: "https://example.com" },
          { role: "Photographer", name: "Jane Doe", url: "" },
        ],
      };
      expect(parseProjectSectionContent("credits", valid, "proj-sec-7")).toEqual(valid);
    });

    it("rejects invalid project section payload", () => {
      expect(() =>
        parseProjectSectionContent(
          "before_after",
          { pairs: [{ beforeMediaId: "not-a-uuid" }] },
          "bad-proj-record",
        ),
      ).toThrow(ContentValidationError);
    });
  });

  describe("Section Settings Schema", () => {
    it("parses empty or customized section settings", () => {
      expect(settingsSchema.parse({})).toEqual({});
      expect(settingsSchema.parse({ background: "surface", padding: "tight" })).toEqual({
        background: "surface",
        padding: "tight",
      });
    });
  });
});
