import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Credibility } from "@/components/home/Credibility";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { FinalCTA } from "@/components/home/FinalCTA";
import { MaterialMoment } from "@/components/home/MaterialMoment";
import { Positioning } from "@/components/home/Positioning";
import { placeholderCtaContent } from "@/lib/content/placeholder-home";
import { featuredProjects, placeholderMaterialMedia } from "@/lib/content/placeholder-projects";

describe("empty optional sections leave no gap", () => {
  it("MaterialMoment renders nothing without media", () => {
    const { container } = render(
      <MaterialMoment content={{ title: "Material", intro: "", mediaIds: [] }} media={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("Credibility renders nothing without confirmed stats or testimonials", () => {
    const { container } = render(
      <Credibility
        content={{ title: "Background", stats: [], testimonialIds: [] }}
        testimonials={[]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("Credibility drops blank stats rather than rendering empty rows", () => {
    render(
      <Credibility
        content={{
          title: "Background",
          stats: [
            { value: "3.72", label: "GPA" },
            { value: "", label: "" },
          ],
          testimonialIds: [],
        }}
        testimonials={[]}
      />,
    );
    expect(screen.getAllByRole("definition")).toHaveLength(1);
  });

  it("Positioning renders nothing without lines", () => {
    const { container } = render(
      <Positioning content={{ eyebrow: "", lines: ["", "  "], body: "" }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("FeaturedProjects renders nothing with no projects", () => {
    const { container } = render(
      <FeaturedProjects content={{ title: "Selected", intro: "", maxItems: 5 }} projects={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("FeaturedProjects", () => {
  it("honours maxItems", () => {
    render(
      <FeaturedProjects
        content={{ title: "Selected", intro: "", maxItems: 2 }}
        projects={featuredProjects()}
      />,
    );
    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  it("exposes each project's metadata in the document, not on hover", () => {
    const [project] = featuredProjects();
    render(
      <FeaturedProjects
        content={{ title: "Selected", intro: "", maxItems: 1 }}
        projects={[project!]}
      />,
    );

    expect(screen.getByRole("heading", { name: project!.title })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(project!.projectType))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(String(project!.year)))).toBeInTheDocument();
  });

  it("omits an empty location instead of printing a dangling separator", () => {
    const project = { ...featuredProjects()[1]!, location: "" };
    render(
      <FeaturedProjects
        content={{ title: "Selected", intro: "", maxItems: 1 }}
        projects={[project]}
      />,
    );
    expect(screen.getByText(`${project.projectType} — ${project.year}`)).toBeInTheDocument();
  });
});

describe("MaterialMoment", () => {
  it("renders every supplied study", () => {
    render(
      <MaterialMoment
        content={{ title: "Material", intro: "", mediaIds: [] }}
        media={placeholderMaterialMedia}
      />,
    );
    expect(screen.getAllByRole("img")).toHaveLength(placeholderMaterialMedia.length);
  });
});

describe("FinalCTA", () => {
  it("is a plain link that needs no animation to be reachable", () => {
    render(<FinalCTA content={placeholderCtaContent} />);
    const link = screen.getByRole("link", { name: placeholderCtaContent.ctaLabel });
    expect(link).toHaveAttribute("href", placeholderCtaContent.ctaHref);
    expect(link).toBeVisible();
  });
});
