import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeSectionRenderer } from "@/components/home/HomeSectionRenderer";
import type { PageSection } from "@/types/content";
import type { ResolvedHomeSection } from "@/lib/content/home-sections";

function resolvedSection(overrides: Partial<PageSection>): ResolvedHomeSection {
  const section: PageSection = {
    id: "00000000-0000-0000-0000-000000000001",
    pageId: "00000000-0000-0000-0000-000000000010",
    sectionKey: "positioning",
    sectionType: "positioning",
    content: { eyebrow: "", lines: ["A line"], body: "" },
    settings: {},
    sortOrder: 0,
    isEnabled: true,
    status: "published",
    ...overrides,
  };

  return {
    section,
    heroMedia: null,
    signatureProject: null,
    featuredProjects: [],
    services: [],
    processSteps: [],
    media: [],
    testimonials: [],
  };
}

describe("HomeSectionRenderer", () => {
  it("renders enabled published sections in sort order through the registry", () => {
    render(
      <HomeSectionRenderer
        sections={[
          resolvedSection({
            id: "00000000-0000-0000-0000-000000000002",
            sectionType: "cta",
            sectionKey: "cta",
            sortOrder: 2,
            content: {
              eyebrow: "",
              title: "Second section",
              body: "",
              ctaLabel: "Contact",
              ctaHref: "/contact",
            },
          }),
          resolvedSection({
            id: "00000000-0000-0000-0000-000000000003",
            sectionType: "positioning",
            sectionKey: "positioning",
            sortOrder: 1,
            content: { eyebrow: "", lines: ["First section"], body: "" },
          }),
        ]}
      />,
    );

    const text = document.body.textContent ?? "";
    expect(text.indexOf("First section")).toBeLessThan(text.indexOf("Second section"));
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "/contact");
  });

  it("does not render disabled/draft rows or crash when optional references are missing", () => {
    render(
      <HomeSectionRenderer
        sections={[
          resolvedSection({
            sectionType: "home_hero",
            sectionKey: "hero",
            content: {
              eyebrow: "Interior design",
              headline: "A visible hero",
              subheadline: "",
              location: "",
              heroMediaId: "00000000-0000-0000-0000-000000000101",
              signatureProjectId: "00000000-0000-0000-0000-000000000201",
              primaryCtaLabel: "Projects",
              primaryCtaHref: "/projects",
              secondaryCtaLabel: "",
              secondaryCtaHref: "/about",
            },
          }),
          resolvedSection({
            id: "00000000-0000-0000-0000-000000000004",
            sectionType: "cta",
            sectionKey: "draft-cta",
            status: "draft",
            content: {
              eyebrow: "",
              title: "Hidden draft",
              body: "",
              ctaLabel: "Hidden",
              ctaHref: "/hidden",
            },
          }),
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "A visible hero" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Hidden draft" })).not.toBeInTheDocument();
  });
});
