import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getFeaturedProjects: vi.fn(),
  getPublishedProjectById: vi.fn(),
  getPublishedPageSections: vi.fn(),
  getPublicMediaAssetsByIds: vi.fn(),
  getPublishedProcessSteps: vi.fn(),
  getPublishedServices: vi.fn(),
  getPublishedTestimonials: vi.fn(),
}));

vi.mock("@/lib/data/projects", () => ({
  getFeaturedProjects: mocks.getFeaturedProjects,
  getPublishedProjectById: mocks.getPublishedProjectById,
}));
vi.mock("@/lib/data/pages", () => ({
  getPublishedPageSections: mocks.getPublishedPageSections,
}));
vi.mock("@/lib/data/media", () => ({
  getPublicMediaAssetsByIds: mocks.getPublicMediaAssetsByIds,
}));
vi.mock("@/lib/data/process", () => ({
  getPublishedProcessSteps: mocks.getPublishedProcessSteps,
}));
vi.mock("@/lib/data/services", () => ({
  getPublishedServices: mocks.getPublishedServices,
}));
vi.mock("@/lib/data/testimonials", () => ({
  getPublishedTestimonials: mocks.getPublishedTestimonials,
}));

import { getHomePageSections } from "@/lib/content/home-sections";
import type {
  MediaAsset,
  PageSection,
  ProjectSummary,
  ServiceSummary,
  Testimonial,
} from "@/types/content";

const PAGE_ID = "00000000-0000-0000-0000-000000000001";
const HOME_HERO_ID = "00000000-0000-0000-0000-000000000002";
const FEATURED_ID = "00000000-0000-0000-0000-000000000003";
const SERVICES_ID = "00000000-0000-0000-0000-000000000004";
const MEDIA_ID = "00000000-0000-0000-0000-000000000101";
const PROJECT_ID = "00000000-0000-0000-0000-000000000201";
const TESTIMONIAL_ID = "00000000-0000-0000-0000-000000000301";

function section(overrides: Partial<PageSection>): PageSection {
  return {
    id: "00000000-0000-0000-0000-000000000999",
    pageId: PAGE_ID,
    sectionKey: "section",
    sectionType: "positioning",
    content: { eyebrow: "", lines: ["A line"], body: "" },
    settings: {},
    sortOrder: 0,
    isEnabled: true,
    status: "published",
    ...overrides,
  };
}

function media(id = MEDIA_ID): MediaAsset {
  return {
    id,
    bucket: "portfolio-public",
    storagePath: `/fixtures/${id}.png`,
    mediaType: "image",
    altText: `Alt ${id}`,
    caption: null,
    photographer: null,
    width: 1200,
    height: 900,
    posterPath: null,
    mimeType: "image/png",
  };
}

function project(overrides: Partial<ProjectSummary> = {}): ProjectSummary {
  return {
    id: PROJECT_ID,
    slug: "sample-project",
    title: "Sample project",
    year: 2026,
    location: "Jakarta",
    projectType: "Hospitality",
    areaSqm: null,
    projectStatus: "concept",
    summary: "A sample project.",
    heroMedia: null,
    featured: true,
    featuredOrder: 0,
    sortOrder: 0,
    ...overrides,
  };
}

const service: ServiceSummary = {
  id: "00000000-0000-0000-0000-000000000401",
  slug: "hospitality",
  name: "Hospitality",
  shortDescription: "Spatial experience.",
  media: null,
  sortOrder: 0,
};

const testimonial: Testimonial = {
  id: TESTIMONIAL_ID,
  clientName: "A client",
  clientRole: null,
  projectName: null,
  quote: "A thoughtful process.",
  sortOrder: 0,
};

describe("getHomePageSections", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getFeaturedProjects.mockResolvedValue([]);
    mocks.getPublishedProjectById.mockResolvedValue(null);
    mocks.getPublicMediaAssetsByIds.mockResolvedValue([]);
    mocks.getPublishedProcessSteps.mockResolvedValue([]);
    mocks.getPublishedServices.mockResolvedValue([]);
    mocks.getPublishedTestimonials.mockResolvedValue([]);
  });

  it("keeps only published/enabled sections and resolves their ordered references", async () => {
    const hero = section({
      id: HOME_HERO_ID,
      sectionKey: "hero",
      sectionType: "home_hero",
      sortOrder: 2,
      content: {
        eyebrow: "Interior design",
        headline: "A considered space.",
        subheadline: "",
        location: "",
        heroMediaId: MEDIA_ID,
        signatureProjectId: PROJECT_ID,
        primaryCtaLabel: "Projects",
        primaryCtaHref: "/projects",
        secondaryCtaLabel: "",
        secondaryCtaHref: "/about",
      },
    });
    const featured = section({
      id: FEATURED_ID,
      sectionKey: "featured",
      sectionType: "featured_projects",
      sortOrder: 1,
      content: { title: "Selected", intro: "", maxItems: 2 },
    });
    const services = section({
      id: SERVICES_ID,
      sectionKey: "services",
      sectionType: "services_preview",
      sortOrder: 3,
      content: { title: "Focus", intro: "", maxItems: 1 },
    });
    const hidden = section({ id: "hidden", isEnabled: false, sortOrder: -1 });

    mocks.getPublishedPageSections.mockResolvedValue([hero, hidden, services, featured]);
    mocks.getPublicMediaAssetsByIds.mockResolvedValue([media()]);
    mocks.getPublishedProjectById.mockResolvedValue(project());
    mocks.getFeaturedProjects.mockResolvedValue([
      project({ id: "project-2", featuredOrder: 1 }),
      project({ id: "project-1", featuredOrder: 0 }),
    ]);
    mocks.getPublishedServices.mockResolvedValue([service]);

    const sections = await getHomePageSections();

    expect(sections.map(({ section }) => section.id)).toEqual([
      FEATURED_ID,
      HOME_HERO_ID,
      SERVICES_ID,
    ]);
    expect(mocks.getFeaturedProjects).toHaveBeenCalledWith(2);
    expect(mocks.getPublicMediaAssetsByIds).toHaveBeenCalledWith([MEDIA_ID]);
    expect(sections[1]?.heroMedia).toEqual(media());
    expect(sections[1]?.signatureProject).toEqual(project());
    expect(sections[0]?.featuredProjects.map(({ id }) => id)).toEqual(["project-1", "project-2"]);
    expect(sections[2]?.services).toEqual([service]);
  });

  it("omits missing optional relations without failing the home adapter", async () => {
    const credibility = section({
      sectionType: "credibility",
      content: { title: "Background", stats: [], testimonialIds: [TESTIMONIAL_ID] },
    });
    const gallery = section({
      sectionType: "gallery",
      content: { title: "Gallery", intro: "", mediaIds: [MEDIA_ID] },
    });

    mocks.getPublishedPageSections.mockResolvedValue([credibility, gallery]);
    mocks.getPublishedTestimonials.mockResolvedValue([testimonial]);
    mocks.getPublicMediaAssetsByIds.mockResolvedValue([]);

    const sections = await getHomePageSections();

    expect(sections[0]?.testimonials).toEqual([testimonial]);
    expect(sections[1]?.media).toEqual([]);
    expect(sections[1]?.heroMedia).toBeNull();
  });
});
