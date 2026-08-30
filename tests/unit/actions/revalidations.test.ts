import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  createSecretSupabaseClient: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  getMediaAssetsByIds: vi.fn(),
  indexMediaAssets: vi.fn(),
  mapServiceDetail: vi.fn(),
  mapProcessStep: vi.fn(),
  mapExploration: vi.fn(),
  mapExplorationMedia: vi.fn(),
  mapTestimonial: vi.fn(),
  mapAdminSiteSettings: vi.fn(),
  mapNavigationItem: vi.fn(),
  mapPage: vi.fn(),
  mapPageSection: vi.fn(),
  mapAdminProjectDetail: vi.fn(),
  mapInquiry: vi.fn(),
  mapMediaAsset: vi.fn(),
  getPublicInquiryConfig: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));
vi.mock("@/lib/supabase/secret", () => ({
  createSecretSupabaseClient: mocks.createSecretSupabaseClient,
}));
vi.mock("@/lib/data/media", () => ({
  getMediaAssetsByIds: mocks.getMediaAssetsByIds,
  indexMediaAssets: mocks.indexMediaAssets,
  mapMediaAsset: mocks.mapMediaAsset,
  MEDIA_COLUMNS: "*",
}));
vi.mock("@/lib/data/site", () => ({
  mapAdminSiteSettings: mocks.mapAdminSiteSettings,
  mapNavigationItem: mocks.mapNavigationItem,
  getPublicInquiryConfig: mocks.getPublicInquiryConfig,
}));
vi.mock("@/lib/data/services", () => ({ mapServiceDetail: mocks.mapServiceDetail }));
vi.mock("@/lib/data/process", () => ({ mapProcessStep: mocks.mapProcessStep }));
vi.mock("@/lib/data/explorations", () => ({
  mapExploration: mocks.mapExploration,
  mapExplorationMedia: mocks.mapExplorationMedia,
}));
vi.mock("@/lib/data/testimonials", () => ({ mapTestimonial: mocks.mapTestimonial }));
vi.mock("@/lib/data/pages", () => ({
  mapPage: mocks.mapPage,
  mapPageSection: mocks.mapPageSection,
}));
vi.mock("@/lib/data/projects", () => ({
  mapAdminProjectDetail: mocks.mapAdminProjectDetail,
}));
vi.mock("@/lib/data/inquiries", () => ({ mapInquiry: mocks.mapInquiry }));

import { updateSiteSettings } from "@/lib/actions/site";
import { createNavigationItem } from "@/lib/actions/navigation";
import { createService, deleteService, reorderServices } from "@/lib/actions/services";
import { createProcessStep, reorderProcessSteps } from "@/lib/actions/process";
import { createExploration, reorderExplorations } from "@/lib/actions/explorations";
import { createTestimonial, reorderTestimonials } from "@/lib/actions/testimonials";
import { createMediaAsset, setMediaAssetArchived } from "@/lib/actions/media";
import { submitInquiry, updateInquiry } from "@/lib/actions/inquiries";
import { updatePageMetadata } from "@/lib/actions/pages";
import { createProject, updateProject } from "@/lib/actions/projects";

const ID_1 = "00000000-0000-4000-8000-000000000001";
const MEDIA_ID = "00000000-0000-4000-8000-000000000099";

function query<T>(data: T, error: unknown = null) {
  const builder = {
    data,
    error,
    delete: vi.fn(),
    eq: vi.fn(),
    insert: vi.fn(),
    maybeSingle: vi.fn(),
    order: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
    then: vi.fn(),
    update: vi.fn(),
  };
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.maybeSingle.mockResolvedValue({ data, error });
  builder.single.mockResolvedValue({ data, error });
  builder.then.mockImplementation((resolve: (value: { data: T; error: unknown }) => unknown) =>
    Promise.resolve(resolve({ data, error })),
  );
  return builder;
}

describe("Cache invalidation and content freshness (INT-014)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: ID_1, displayName: "Admin" });
    mocks.getMediaAssetsByIds.mockResolvedValue([]);
    mocks.indexMediaAssets.mockReturnValue({});
  });

  it("revalidates root layout, admin site, and contact on site settings mutation", async () => {
    const builder = query({ id: 1 });
    mocks.createServerSupabaseClient.mockResolvedValue({ from: vi.fn().mockReturnValue(builder) });
    mocks.mapAdminSiteSettings.mockReturnValue({});

    await updateSiteSettings({
      siteName: "Gabrielle Aurelia",
      professionalRole: "Interior Designer",
      location: "Jakarta",
      serviceArea: null,
      email: "contact@example.com",
      phone: null,
      whatsapp: null,
      socialLinks: [],
      footerText: null,
      defaultSeoTitle: "Title",
      defaultSeoDescription: "Description",
      defaultOgMediaId: null,
      inquiryConfig: {
        projectTypes: [],
        projectStatuses: [],
        timelineOptions: [],
        budgetOptions: [],
        showBudgetField: false,
        showPhoneField: true,
        successTitle: "Thanks",
        successBody: "Received",
      },
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/site");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/contact");
  });

  it("revalidates root layout and admin navigation on navigation item creation", async () => {
    const builder = query({ id: ID_1 });
    mocks.createServerSupabaseClient.mockResolvedValue({ from: vi.fn().mockReturnValue(builder) });
    mocks.mapNavigationItem.mockReturnValue({});

    await createNavigationItem({
      label: "Portfolio",
      href: "/projects",
      placement: "header",
      sortOrder: 0,
      isVisible: true,
      targetBlank: false,
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/navigation");
  });

  it("revalidates public pages and admin routes on service mutation, delete, and reorder", async () => {
    const builder = query({ id: ID_1 });
    const rpc = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
      rpc,
    });
    mocks.mapServiceDetail.mockReturnValue({});

    await createService({
      slug: "interior-architecture",
      name: "Interior Architecture",
      shortDescription: "Complete interior architectural planning.",
      fullDescription: "",
      idealClient: "",
      scope: [],
      deliverables: [],
      included: [],
      excluded: [],
      typicalProjectTypes: [],
      mediaId: null,
      sortOrder: 0,
      featured: false,
      status: "published",
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/services");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/contact");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/services");

    vi.clearAllMocks();
    await deleteService(ID_1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/services");

    vi.clearAllMocks();
    await reorderServices([ID_1]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/services");
  });

  it("revalidates public process and admin routes on process step mutation and reorder", async () => {
    const builder = query({ id: ID_1 });
    const rpc = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
      rpc,
    });
    mocks.mapProcessStep.mockReturnValue({});

    await createProcessStep({
      stepNo: 1,
      title: "Discovery & Brief",
      description: "Initial spatial dialogue.",
      mediaId: null,
      sortOrder: 0,
      status: "published",
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/process");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/process");

    vi.clearAllMocks();
    await reorderProcessSteps([ID_1]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/process");
  });

  it("revalidates explorations and admin route on exploration mutation and reorder", async () => {
    const builder = query({ id: ID_1 });
    const rpc = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
      rpc,
    });
    mocks.mapExploration.mockReturnValue({});

    await createExploration({
      slug: "travertine-study",
      title: "Travertine Study",
      category: "Materiality",
      description: "",
      year: 2026,
      coverMediaId: null,
      sortOrder: 0,
      status: "published",
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/explorations");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/explorations");

    vi.clearAllMocks();
    await reorderExplorations([ID_1]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/explorations");
  });

  it("revalidates home and admin route on testimonial mutation and reorder", async () => {
    const builder = query({ id: ID_1 });
    const rpc = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
      rpc,
    });
    mocks.mapTestimonial.mockReturnValue({});

    await createTestimonial({
      clientName: "Private Client",
      clientRole: "Homeowner",
      projectName: "Menteng Sanctuary",
      quote: "Exceptional spatial clarity.",
      sortOrder: 0,
      featured: true,
      status: "published",
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/testimonials");

    vi.clearAllMocks();
    await reorderTestimonials([ID_1]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/testimonials");
  });

  it("revalidates public pages on page metadata update", async () => {
    const builder = query({ id: ID_1, slug: "about" });
    mocks.createServerSupabaseClient.mockResolvedValue({ from: vi.fn().mockReturnValue(builder) });
    mocks.mapPage.mockReturnValue({});

    await updatePageMetadata({
      id: ID_1,
      slug: "about",
      title: "About Studio",
      navLabel: "About",
      seoTitle: "About Gabrielle Aurelia",
      seoDescription: "Design philosophy",
      ogMediaId: null,
      status: "published",
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/pages");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/pages/about");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/about");
  });

  it("revalidates project routes on project creation and update", async () => {
    const rawRow = {
      id: ID_1,
      slug: "menteng-sanctuary",
      title: "Menteng Sanctuary",
      year: 2025,
      location: "Jakarta",
      project_type: "Residential",
      area_sqm: 400,
      project_status: "completed",
      client_type: "Private",
      design_role: [],
      services: [],
      summary: "Sanctuary narrative",
      hero_media_id: MEDIA_ID,
      featured: true,
      featured_order: 1,
      sort_order: 0,
      seo_title: null,
      seo_description: null,
      og_media_id: null,
      status: "published",
    };
    const builder = query(rawRow);
    mocks.createServerSupabaseClient.mockResolvedValue({ from: vi.fn().mockReturnValue(builder) });
    mocks.mapAdminProjectDetail.mockReturnValue({});

    await createProject({
      slug: "menteng-sanctuary",
      title: "Menteng Sanctuary",
      year: 2025,
      location: "Jakarta",
      projectType: "Residential",
      areaSqm: 400,
      projectStatus: "completed",
      clientType: "Private",
      designRole: [],
      services: [],
      summary: "Sanctuary narrative",
      heroMediaId: MEDIA_ID,
      featured: true,
      featuredOrder: 1,
      sortOrder: 0,
      seoTitle: null,
      seoDescription: null,
      ogMediaId: null,
      status: "published",
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/projects");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/");

    vi.clearAllMocks();
    await updateProject({
      id: ID_1,
      slug: "menteng-sanctuary",
      title: "Menteng Sanctuary",
      year: 2025,
      location: "Jakarta",
      projectType: "Residential",
      areaSqm: 400,
      projectStatus: "completed",
      clientType: "Private",
      designRole: [],
      services: [],
      summary: "Sanctuary narrative",
      heroMediaId: MEDIA_ID,
      featured: true,
      featuredOrder: 1,
      sortOrder: 0,
      seoTitle: null,
      seoDescription: null,
      ogMediaId: null,
      status: "published",
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/projects/${ID_1}`);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/preview/projects/${ID_1}`);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/projects/menteng-sanctuary");
  });

  it("revalidates media library and layout on media asset creation and archive", async () => {
    const builder = query({ id: ID_1, is_archived: true });
    mocks.createServerSupabaseClient.mockResolvedValue({ from: vi.fn().mockReturnValue(builder) });
    mocks.mapMediaAsset.mockReturnValue({});

    await createMediaAsset({
      bucket: "portfolio-public",
      storagePath: "portfolio/2026/00000000-0000-4000-8000-000000000099-hero.jpg",
      mediaType: "image",
      altText: "Hero",
      caption: null,
      photographer: null,
      width: 1920,
      height: 1080,
      posterPath: null,
      mimeType: "image/jpeg",
      fileSizeBytes: 2048,
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/media");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");

    vi.clearAllMocks();
    await setMediaAssetArchived({ id: ID_1, isArchived: true });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/media");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("revalidates admin inquiries on public inquiry submission and admin update", async () => {
    mocks.getPublicInquiryConfig.mockResolvedValue({
      projectTypes: ["Residential"],
      projectStatuses: ["Planning"],
      timelineOptions: ["3 months"],
      budgetOptions: [],
      showBudgetField: false,
      showPhoneField: true,
      successTitle: "Thank you",
      successBody: "Your inquiry has been received.",
    });

    const builder = query({ id: ID_1, status: "contacted" });
    mocks.createSecretSupabaseClient.mockReturnValue({ from: vi.fn().mockReturnValue(builder) });
    mocks.createServerSupabaseClient.mockResolvedValue({ from: vi.fn().mockReturnValue(builder) });
    mocks.mapInquiry.mockReturnValue({});

    await submitInquiry({
      name: "Client Name",
      email: "client@example.com",
      phone: "+62812345678",
      projectType: "Residential",
      projectLocation: "Jakarta",
      requiredService: "Full Interior Design",
      projectStatus: "Planning",
      desiredTimeline: "3 months",
      projectBrief: "A minimalist apartment.",
    });

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/inquiries");

    vi.clearAllMocks();
    await updateInquiry({ id: ID_1, status: "contacted", adminNotes: "Called client." });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/inquiries");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/inquiries/${ID_1}`);
  });
});
