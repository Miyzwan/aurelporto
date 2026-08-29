import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BeforeAfter } from "@/components/projects/BeforeAfter";
import { ProjectCredits } from "@/components/projects/ProjectCredits";
import { ProjectSectionRenderer } from "@/components/public/ProjectSectionRenderer";
import type { MediaAsset } from "@/types/content";
import type { ProjectSection } from "@/types/project-sections";

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

  it("offers labelled controls rather than requiring a drag", async () => {
    const user = userEvent.setup();
    render(<BeforeAfter pairs={pairs} media={media} />);

    const beforeButton = screen.getByRole("button", { name: "Before" });
    expect(beforeButton).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "After" })).toHaveAttribute("aria-pressed", "true");

    await user.click(beforeButton);
    expect(screen.getByAltText("Alt for before")).toBeInTheDocument();
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
