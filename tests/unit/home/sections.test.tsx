import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Credibility } from "@/components/home/Credibility";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Hero } from "@/components/home/Hero";
import { MaterialMoment } from "@/components/home/MaterialMoment";
import { Positioning } from "@/components/home/Positioning";
import { ProcessPreview } from "@/components/home/ProcessPreview";
import {
  placeholderCtaContent,
  placeholderHeroContent,
  placeholderPositioningContent,
  placeholderProcessPreviewContent,
  placeholderProcessSteps,
} from "@/lib/content/placeholder-home";
import {
  featuredProjects,
  placeholderMaterialMedia,
  placeholderProjects,
} from "@/lib/content/placeholder-projects";

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

  it("adds editorial reveal hooks without hiding project metadata", () => {
    render(
      <FeaturedProjects
        content={{ title: "Selected", intro: "", maxItems: 2 }}
        projects={featuredProjects()}
      />,
    );

    expect(document.querySelectorAll('[data-motion="image-reveal"]')).toHaveLength(2);
    expect(document.querySelectorAll('[data-motion="mask-reveal"]')).toHaveLength(2);
    expect(screen.getByText("Menavigasi Batavia")).toBeInTheDocument();
  });
});

describe("FE-010 signature interactions", () => {
  it("keeps the hero readable while exposing the space reveal hook", () => {
    const project = placeholderProjects[0]!;

    render(
      <Hero
        content={placeholderHeroContent}
        heroMedia={project.heroMedia}
        signatureProject={project}
      />,
    );

    expect(screen.getByRole("heading", { name: placeholderHeroContent.headline })).toBeVisible();
    expect(document.querySelector('[data-motion="hero-space-reveal"]')).toBeInTheDocument();
    expect(screen.getByRole("link", { name: project.title })).toHaveAttribute(
      "href",
      `/projects/${project.slug}`,
    );
  });

  it("renders one mask per positioning line", () => {
    render(<Positioning content={placeholderPositioningContent} />);

    expect(document.querySelectorAll('[data-motion="mask-reveal"]')).toHaveLength(
      placeholderPositioningContent.lines.length,
    );
  });

  it("renders the process progress visualization without changing the list", () => {
    render(
      <ProcessPreview content={placeholderProcessPreviewContent} steps={placeholderProcessSteps} />,
    );

    expect(document.querySelector('[data-motion="process-progress"]')).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(placeholderProcessSteps.length);
  });

  it("uses the velocity strip while keeping every material study in the document", () => {
    render(
      <MaterialMoment
        content={{ title: "Material", intro: "", mediaIds: [] }}
        media={placeholderMaterialMedia}
      />,
    );

    expect(document.querySelector('[data-motion="velocity-strip"]')).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(placeholderMaterialMedia.length);
  });

  it("reveals the final CTA without making the link animation-dependent", () => {
    render(<FinalCTA content={placeholderCtaContent} />);

    expect(document.querySelector('[data-motion="mask-reveal"]')).toBeInTheDocument();
    expect(screen.getByRole("link", { name: placeholderCtaContent.ctaLabel })).toBeVisible();
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
