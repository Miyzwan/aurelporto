import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectFilter, buildFilterOptions } from "@/components/projects/ProjectFilter";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { placeholderProjects } from "@/lib/content/placeholder-projects";
import { slugify } from "@/lib/utils/slugify";

describe("buildFilterOptions", () => {
  it("always leads with All and counts every project", () => {
    const options = buildFilterOptions(placeholderProjects, slugify);
    expect(options[0]).toEqual({ value: null, label: "All", count: placeholderProjects.length });
  });

  it("only lists categories that actually exist", () => {
    const options = buildFilterOptions(
      [{ projectType: "Hospitality" }, { projectType: "Retail" }, { projectType: "Retail" }],
      slugify,
    );
    expect(options.map((o) => o.label)).toEqual(["All", "Retail", "Hospitality"]);
    expect(options.find((o) => o.value === "retail")?.count).toBe(2);
  });

  it("ignores blank category values instead of creating an empty filter", () => {
    const options = buildFilterOptions([{ projectType: "  " }, { projectType: "Office" }], slugify);
    expect(options.map((o) => o.value)).toEqual([null, "office"]);
  });
});

describe("ProjectFilter", () => {
  const options = buildFilterOptions(placeholderProjects, slugify);

  it("renders keyboard-reachable links, not hover-only controls", () => {
    render(<ProjectFilter options={options} active={null} />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(options.length);
    expect(links[0]).toHaveAttribute("href", "/projects");
  });

  it("marks the active category", () => {
    render(<ProjectFilter options={options} active="retail" />);
    expect(screen.getByRole("link", { name: /Retail/ })).toHaveAttribute("aria-current", "true");
  });

  it("hides itself when there is only one real category", () => {
    const { container } = render(
      <ProjectFilter
        options={buildFilterOptions([{ projectType: "Retail" }], slugify)}
        active={null}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe("ProjectGrid", () => {
  it("shows an intentional empty state rather than a blank page", () => {
    render(<ProjectGrid projects={[]} emptyMessage="Projects are being prepared." />);
    expect(screen.getByText("Projects are being prepared.")).toBeInTheDocument();
  });

  it("renders a small set without leaving empty grid cells", () => {
    const { container } = render(<ProjectGrid projects={placeholderProjects.slice(0, 3)} />);
    expect(screen.getAllByRole("article")).toHaveLength(3);
    // A column flow packs each column independently, so an odd count never
    // reserves a cell and leaves it blank.
    const flow = container.firstElementChild;
    expect(flow?.className).toContain("columns-2");
    expect(flow?.className).not.toMatch(/col-start|grid-cols/);
  });

  it("keeps a project's shape stable across filter states", () => {
    const first = render(<ProjectGrid projects={placeholderProjects} />);
    const shapeInFullList = first.container
      .querySelectorAll("[style*='aspect-ratio']")[0]
      ?.getAttribute("style");
    first.unmount();

    const second = render(<ProjectGrid projects={placeholderProjects} />);
    expect(
      second.container.querySelectorAll("[style*='aspect-ratio']")[0]?.getAttribute("style"),
    ).toBe(shapeInFullList);
  });
});
