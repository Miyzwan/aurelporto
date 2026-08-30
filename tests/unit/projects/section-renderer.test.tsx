import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BeforeAfter } from "@/components/projects/BeforeAfter";
import { EditorialGallery } from "@/components/projects/EditorialGallery";
import { NextProject } from "@/components/projects/NextProject";
import { PlanSequence } from "@/components/projects/PlanSequence";
import { ProjectCredits } from "@/components/projects/ProjectCredits";
import { ProjectSectionRenderer } from "@/components/public/ProjectSectionRenderer";
import type { MediaAsset } from "@/types/content";
import type { PlanSequenceItem, ProjectSection } from "@/types/project-sections";

function asset(id: string): MediaAsset {
  return {
    id,
    bucket: "portfolio-public",
    storagePath: `/fixtures/${id}.png`,
    mediaType: "image",
    altText: `Alt for ${id}`,
    caption: null,
    photographer: null,
    width: 1200,
    height: 900,
    posterPath: null,
    mimeType: "image/png",
  };
}

function section(overrides: Partial<ProjectSection>): ProjectSection {
  return {
    id: "s1",
    sectionKey: "k1",
    sectionType: "overview",
    title: null,
    content: { body: "Body text", mediaIds: [] },
    sortOrder: 0,
    isEnabled: true,
    media: {},
    ...overrides,
  };
}

afterEach(() => vi.unstubAllEnvs());

describe("ProjectSectionRenderer", () => {
  it("renders sections in sort_order, not array order", () => {
    render(
      <ProjectSectionRenderer
        sections={[
          section({ id: "b", sortOrder: 2, content: { body: "Second", mediaIds: [] } }),
          section({ id: "a", sortOrder: 1, content: { body: "First", mediaIds: [] } }),
        ]}
      />,
    );

    const paragraphs = screen.getAllByText(/First|Second/).map((el) => el.textContent);
    expect(paragraphs).toEqual(["First", "Second"]);
  });

  it("skips disabled sections", () => {
    render(
      <ProjectSectionRenderer
        sections={[section({ isEnabled: false, content: { body: "Hidden", mediaIds: [] } })]}
      />,
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("omits an optional section whose content is empty", () => {
    const { container } = render(
      <ProjectSectionRenderer
        sections={[
          section({ sectionType: "gallery", content: { intro: "", mediaIds: [] } }),
          section({ id: "s2", sectionType: "credits", content: { items: [] } }),
        ]}
      />,
    );
    expect(container.textContent).toBe("");
  });

  it("survives a malformed content payload instead of crashing", () => {
    expect(() =>
      render(<ProjectSectionRenderer sections={[section({ content: null })]} />),
    ).not.toThrow();
    expect(() =>
      render(
        <ProjectSectionRenderer
          sections={[section({ sectionType: "plan_sequence", content: { items: "nope" } })]}
        />,
      ),
    ).not.toThrow();
  });

  it("fails visibly in development for an unknown section type", () => {
    vi.stubEnv("NODE_ENV", "development");
    render(<ProjectSectionRenderer sections={[section({ sectionType: "teleporter" })]} />);
    expect(screen.getByText(/Unknown project section type/)).toBeInTheDocument();
  });

  it("logs and skips an unknown section type in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    const { container } = render(
      <ProjectSectionRenderer sections={[section({ sectionType: "teleporter" })]} />,
    );

    expect(container.textContent).toBe("");
    expect(error).toHaveBeenCalledWith(expect.stringContaining("teleporter"));
    error.mockRestore();
  });
});

describe("BeforeAfter", () => {
  const media = { before: asset("before"), after: asset("after") };
  const pairs = [{ label: "Reception", beforeMediaId: "before", afterMediaId: "after" }];

  it("supports pointer/touch input through a native slider and keyboard fallback", async () => {
    const user = userEvent.setup();
    render(<BeforeAfter pairs={pairs} media={media} />);

    const slider = screen.getByRole("slider", { name: "Adjust before and after comparison" });
    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveValue("100");

    const beforeButton = screen.getByRole("button", { name: "Before" });
    expect(beforeButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "After" })).toHaveAttribute("aria-pressed", "true");

    await user.click(beforeButton);
    expect(slider).toHaveValue("0");
    expect(screen.getByAltText("Alt for before")).toBeInTheDocument();

    slider.focus();
    await user.keyboard("{ArrowRight}");
    expect(slider).toHaveValue("1");
    expect(slider).toHaveAttribute("aria-valuetext", "Partial comparison");

    fireEvent.change(slider, { target: { value: "45" } });
    expect(slider).toHaveValue("45");
  });

  it("skips a pair whose media is missing rather than rendering half a comparison", () => {
    const { container } = render(
      <BeforeAfter
        pairs={[{ label: "x", beforeMediaId: "before", afterMediaId: "gone" }]}
        media={media}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("FE-011 project storytelling interactions", () => {
  it("keeps every plan step in the document while exposing a desktop sequence hook", () => {
    const items: PlanSequenceItem[] = [
      { title: "Existing", type: "existing", mediaId: "one", caption: "First" },
      { title: "Layout", type: "layout", mediaId: "two", caption: "Second" },
    ];

    render(
      <PlanSequence
        title="Spatial planning"
        intro=""
        items={items}
        media={{ one: asset("one"), two: asset("two") }}
      />,
    );

    expect(document.querySelector('[data-motion="plan-sequence"]')).toBeInTheDocument();
    expect(document.querySelectorAll("[data-plan-sequence-step]")).toHaveLength(2);
    expect(screen.getByText("Existing")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Layout" })).toBeVisible();
  });

  it("adds reveal hooks to gallery media without changing the editorial order", () => {
    render(<EditorialGallery media={[asset("one"), asset("two"), asset("three")]} />);

    expect(document.querySelectorAll('[data-motion="image-reveal"]')).toHaveLength(3);
    expect(screen.getByAltText("Alt for one")).toBeInTheDocument();
    expect(screen.getByAltText("Alt for two")).toBeInTheDocument();
    expect(screen.getByAltText("Alt for three")).toBeInTheDocument();
  });

  it("renders a full-width next-project preview as a normal link", () => {
    render(
      <NextProject
        project={{
          id: "next",
          slug: "next-project",
          title: "Next Project",
          year: 2026,
          location: "Jakarta",
          projectType: "Residential",
          areaSqm: null,
          projectStatus: "concept",
          summary: "A next project.",
          heroMedia: asset("next"),
          featured: false,
          featuredOrder: 0,
          sortOrder: 1,
        }}
      />,
    );

    expect(document.querySelector('[data-motion="full-width-preview"]')).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Next Project/i })).toHaveAttribute(
      "href",
      "/projects/next-project",
    );
  });
});

describe("ProjectCredits", () => {
  it("links only http(s) urls", () => {
    render(
      <ProjectCredits
        items={[
          { role: "Photography", name: "Safe", url: "https://example.com" },
          { role: "Contractor", name: "Unsafe", url: "javascript:alert(1)" },
          { role: "Styling", name: "Plain", url: "" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Safe" })).toHaveAttribute(
      "rel",
      "noreferrer noopener nofollow",
    );
    expect(screen.queryByRole("link", { name: "Unsafe" })).not.toBeInTheDocument();
    expect(screen.getByText("Unsafe")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Plain" })).not.toBeInTheDocument();
  });
});
