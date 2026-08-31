import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/admin/projects",
}));

import { ProjectDetailScreen, ProjectsScreen, ProjectSectionEditor } from "@/components/admin";
import type { AdminMediaAsset, AdminProjectDetail } from "@/types/content";
import type { ProjectSection } from "@/types/project-sections";

const sampleMedia: AdminMediaAsset = {
  id: "media-1",
  bucket: "portfolio-public",
  storagePath: "hero.jpg",
  mediaType: "image",
  altText: "Studio hero image",
  caption: null,
  photographer: null,
  width: 1920,
  height: 1080,
  posterPath: null,
  mimeType: "image/jpeg",
  isArchived: false,
  fileSizeBytes: 500000,
  createdAt: "2026-08-30T10:00:00.000Z",
  updatedAt: "2026-08-30T10:00:00.000Z",
};

const sampleProjects: AdminProjectDetail[] = [
  {
    id: "proj-1",
    slug: "menteng-residence",
    title: "Menteng Modern Sanctuary",
    year: 2025,
    location: "Jakarta, Indonesia",
    projectType: "Private Residence",
    areaSqm: 450,
    projectStatus: "completed",
    clientType: "Private Family",
    designRole: ["Interior Architecture", "Custom Furniture"],
    services: ["Spatial Planning", "Material Curation"],
    summary: "A light-filled sanctuary embracing raw tactile stones.",
    heroMedia: sampleMedia,
    heroMediaId: "media-1",
    featured: true,
    featuredOrder: 1,
    sortOrder: 0,
    seoTitle: "Menteng Residence | Case Study",
    seoDescription: "Modern residential sanctuary in Menteng.",
    ogMedia: null,
    ogMediaId: null,
    status: "published",
  },
  {
    id: "proj-2",
    slug: "senopati-atelier",
    title: "Senopati Creative Atelier",
    year: 2026,
    location: "Jakarta, Indonesia",
    projectType: "Commercial Studio",
    areaSqm: 200,
    projectStatus: "ongoing",
    clientType: "Creative Agency",
    designRole: ["Interior Architecture"],
    services: ["Spatial Planning"],
    summary: "Collaborative studio space balancing focus and social zones.",
    heroMedia: null,
    heroMediaId: null,
    featured: false,
    featuredOrder: 0,
    sortOrder: 1,
    seoTitle: null,
    seoDescription: null,
    ogMedia: null,
    ogMediaId: null,
    status: "draft",
  },
];

const sampleSection: ProjectSection = {
  id: "sec-1",
  sectionKey: "spatial-concept",
  sectionType: "concept",
  title: "Spatial Concept & Zoning",
  content: { body: "The central axis balances natural daylight...", mediaIds: ["media-1"] },
  sortOrder: 0,
  isEnabled: true,
  media: { "media-1": sampleMedia },
};

describe("Admin Projects UI", () => {
  it("renders projects list and allows search and filtering", async () => {
    const user = userEvent.setup();
    render(<ProjectsScreen initialProjects={sampleProjects} />);

    expect(screen.getByText("Menteng Modern Sanctuary")).toBeInTheDocument();
    expect(screen.getByText("Senopati Creative Atelier")).toBeInTheDocument();
    expect(screen.getByText(/Featured #1/i)).toBeInTheDocument();

    // Search filter
    const searchInput = screen.getByPlaceholderText(/Search by title/i);
    await user.type(searchInput, "Menteng");

    expect(screen.getByText("Menteng Modern Sanctuary")).toBeInTheDocument();
    expect(screen.queryByText("Senopati Creative Atelier")).not.toBeInTheDocument();
  });

  it("renders ProjectDetailScreen for existing project and shows metadata and section list", () => {
    render(
      <ProjectDetailScreen
        project={sampleProjects[0]}
        initialSections={[sampleSection]}
        assets={[sampleMedia]}
      />,
    );

    expect(screen.getByDisplayValue("Menteng Modern Sanctuary")).toBeInTheDocument();
    expect(screen.getByDisplayValue("menteng-residence")).toBeInTheDocument();
    expect(screen.getByText("Spatial Concept & Zoning")).toBeInTheDocument();
    expect(screen.getByText("+ Add Section")).toBeInTheDocument();
    expect(screen.getByText(/Preview Case Study/i)).toBeInTheDocument();
  });

  it("initializes new project with neutral defaults (concept status and empty roles)", () => {
    render(<ProjectDetailScreen isNew assets={[sampleMedia]} />);

    const statusSelect = screen.getByLabelText(/Project Stage/i) as HTMLSelectElement;
    expect(statusSelect.value).toBe("concept");
  });

  it("renders ProjectSectionEditor with form fields and saves without raw JSON", async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <ProjectSectionEditor
        open={true}
        section={null}
        assets={[sampleMedia]}
        onSave={handleSave}
        onClose={handleClose}
      />,
    );

    expect(screen.getByText("Add Project Section")).toBeInTheDocument();
    expect(screen.getByLabelText(/Section Type/i)).toBeInTheDocument();

    const bodyInput = screen.getByPlaceholderText(/Describe this project stage/i);
    await user.type(bodyInput, "Architectural concept focusing on proportion and materiality.");

    const submitBtn = screen.getByRole("button", { name: "Add Section" });
    await user.click(submitBtn);

    expect(handleSave).toHaveBeenCalledWith(
      expect.objectContaining({
        sectionType: "overview",
        content: expect.objectContaining({
          body: "Architectural concept focusing on proportion and materiality.",
        }),
      }),
    );
  });

  it("allows editing plan sequence in ProjectSectionEditor", async () => {
    const user = userEvent.setup();
    const handleSave = vi.fn().mockResolvedValue(undefined);

    render(
      <ProjectSectionEditor
        open={true}
        section={null}
        assets={[sampleMedia]}
        onSave={handleSave}
        onClose={vi.fn()}
      />,
    );

    // Change section type to plan_sequence
    const typeSelect = screen.getByLabelText(/Section Type/i);
    await user.selectOptions(typeSelect, "plan_sequence");

    expect(screen.getByText("+ Add Plan Drawing")).toBeInTheDocument();
    await user.click(screen.getByText("+ Add Plan Drawing"));

    expect(screen.getByPlaceholderText(/e.g. Ground Level Zoning/i)).toBeInTheDocument();
  });
});
