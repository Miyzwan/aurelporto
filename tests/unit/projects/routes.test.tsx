import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import type { ProjectDetail, ProjectSummary } from "@/types/content";
import type { ProjectSection } from "@/types/project-sections";

const mocks = vi.hoisted(() => ({
  getNextPublishedProject: vi.fn(),
  getPublishedProjectBySlug: vi.fn(),
  getPublishedProjectSections: vi.fn(),
  getPublishedProjects: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/data/projects", () => ({
  getNextPublishedProject: mocks.getNextPublishedProject,
  getPublishedProjectBySlug: mocks.getPublishedProjectBySlug,
  getPublishedProjectSections: mocks.getPublishedProjectSections,
  getPublishedProjects: mocks.getPublishedProjects,
}));

vi.mock("@/components/public/Section", () => ({
  Section: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}));
vi.mock("@/components/projects/NextProject", () => ({
  NextProject: ({ project }: { project: ProjectSummary | null }) => (
    <aside data-testid="next-project">{project?.title}</aside>
  ),
}));
vi.mock("@/components/projects/ProjectFacts", () => ({
  ProjectFacts: ({ project }: { project: ProjectSummary }) => (
    <div data-testid="project-facts">{project.projectStatus}</div>
  ),
}));
vi.mock("@/components/projects/ProjectHero", () => ({
  ProjectHero: ({ project }: { project: ProjectSummary }) => <h1>{project.title}</h1>,
}));
vi.mock("@/components/public/ProjectSectionRenderer", () => ({
  ProjectSectionRenderer: ({ sections }: { sections: ProjectSection[] }) => (
    <div data-testid="project-sections">
      {sections.map((section) => section.sectionKey).join(",")}
    </div>
  ),
}));
vi.mock("@/components/projects/ProjectFilter", () => ({
  ProjectFilter: ({ active }: { active: string | null }) => (
    <div data-testid="project-filter">{active ?? "all"}</div>
  ),
  buildFilterOptions: (projects: ProjectSummary[], slugify: (value: string) => string) => [
    { value: null, label: "All", count: projects.length },
    ...Array.from(new Set(projects.map((project) => project.projectType))).map((label) => ({
      value: slugify(label),
      label,
      count: projects.filter((project) => project.projectType === label).length,
    })),
  ],
}));
vi.mock("@/components/projects/ProjectGrid", () => ({
  ProjectGrid: ({ projects }: { projects: ProjectSummary[] }) => (
    <div data-testid="project-grid">
      {projects.map((project) => (
        <article key={project.id}>{project.title}</article>
      ))}
    </div>
  ),
}));

import ProjectCaseStudyPage from "@/app/(public)/projects/[slug]/page";
import ProjectsPage from "@/app/(public)/projects/page";

const PROJECT_ID = "00000000-0000-0000-0000-000000000001";

function summary(overrides: Partial<ProjectSummary> = {}): ProjectSummary {
  return {
    id: PROJECT_ID,
    slug: "published-project",
    title: "Published Project",
    year: 2026,
    location: "Jakarta",
    projectType: "Office",
    areaSqm: null,
    projectStatus: "concept",
    summary: "A published project.",
    heroMedia: null,
    featured: false,
    featuredOrder: 0,
    sortOrder: 0,
    ...overrides,
  };
}

function detail(overrides: Partial<ProjectDetail> = {}): ProjectDetail {
  return {
    ...summary(),
    clientType: null,
    designRole: [],
    services: [],
    seoTitle: null,
    seoDescription: null,
    ogMedia: null,
    ...overrides,
  };
}

describe("public project routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  it("loads published projects and applies the category query parameter", async () => {
    const office = summary();
    const retail = summary({
      id: "00000000-0000-0000-0000-000000000002",
      slug: "published-retail",
      title: "Published Retail",
      projectType: "Retail",
      sortOrder: 1,
    });
    mocks.getPublishedProjects.mockResolvedValue([office, retail]);

    render(
      await ProjectsPage({
        params: Promise.resolve({}),
        searchParams: Promise.resolve({ category: "office" }),
      }),
    );

    expect(mocks.getPublishedProjects).toHaveBeenCalledOnce();
    expect(screen.getByTestId("project-filter")).toHaveTextContent("office");
    expect(screen.getByRole("article", { name: "" })).toHaveTextContent("Published Project");
    expect(screen.queryByText("Published Retail")).not.toBeInTheDocument();
  });

  it("loads a published case study, its sections, and deterministic next project", async () => {
    const project = detail({ projectStatus: "ongoing" });
    const next = summary({
      id: "00000000-0000-0000-0000-000000000002",
      slug: "next-project",
      title: "Next Project",
      sortOrder: 1,
    });
    const sections: ProjectSection[] = [
      {
        id: "section-1",
        sectionKey: "concept",
        sectionType: "concept",
        title: null,
        content: { body: "Concept", mediaIds: [] },
        sortOrder: 0,
        isEnabled: true,
        media: {},
      },
    ];
    mocks.getPublishedProjectBySlug.mockResolvedValue(project);
    mocks.getPublishedProjectSections.mockResolvedValue(sections);
    mocks.getNextPublishedProject.mockResolvedValue(next);

    render(
      await ProjectCaseStudyPage({
        params: Promise.resolve({ slug: project.slug }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(mocks.getPublishedProjectBySlug).toHaveBeenCalledWith(project.slug);
    expect(mocks.getPublishedProjectSections).toHaveBeenCalledWith(project.id);
    expect(mocks.getNextPublishedProject).toHaveBeenCalledWith(project.id);
    expect(screen.getByRole("heading", { name: project.title })).toBeInTheDocument();
    expect(screen.getByTestId("project-facts")).toHaveTextContent("ongoing");
    expect(screen.getByTestId("project-sections")).toHaveTextContent("concept");
    expect(screen.getByTestId("next-project")).toHaveTextContent("Next Project");
  });

  it("returns notFound for an unpublished or nonexistent slug", async () => {
    mocks.getPublishedProjectBySlug.mockResolvedValue(null);

    await expect(
      ProjectCaseStudyPage({
        params: Promise.resolve({ slug: "draft-project" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(mocks.notFound).toHaveBeenCalledOnce();
    expect(mocks.getPublishedProjectSections).not.toHaveBeenCalled();
    expect(mocks.getNextPublishedProject).not.toHaveBeenCalled();
  });
});
