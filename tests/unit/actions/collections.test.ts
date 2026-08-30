import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  mapServiceDetail: vi.fn(),
  mapProcessStep: vi.fn(),
  mapExploration: vi.fn(),
  mapExplorationMedia: vi.fn(),
  mapTestimonial: vi.fn(),
  getMediaAssetsByIds: vi.fn(),
  indexMediaAssets: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));
vi.mock("@/lib/data/media", () => ({
  getMediaAssetsByIds: mocks.getMediaAssetsByIds,
  indexMediaAssets: mocks.indexMediaAssets,
}));
vi.mock("@/lib/data/services", () => ({ mapServiceDetail: mocks.mapServiceDetail }));
vi.mock("@/lib/data/process", () => ({ mapProcessStep: mocks.mapProcessStep }));
vi.mock("@/lib/data/explorations", () => ({
  mapExploration: mocks.mapExploration,
  mapExplorationMedia: mocks.mapExplorationMedia,
}));
vi.mock("@/lib/data/testimonials", () => ({ mapTestimonial: mocks.mapTestimonial }));

import { createExploration, reorderExplorations } from "@/lib/actions/explorations";
import { createProcessStep } from "@/lib/actions/process";
import { createService } from "@/lib/actions/services";
import { createTestimonial } from "@/lib/actions/testimonials";

const ADMIN_ID = "00000000-0000-4000-8000-000000000001";
const RECORD_ID = "00000000-0000-4000-8000-000000000002";

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

const baseService = {
  id: RECORD_ID,
  slug: "interior-direction",
  name: "Interior direction",
  short_description: "A considered design direction.",
  full_description: null,
  ideal_client: null,
  scope: [],
  deliverables: [],
  included: [],
  excluded: [],
  typical_project_types: [],
  media_id: null,
  sort_order: 0,
  featured: false,
  status: "draft" as const,
  created_at: "2026-08-30T10:00:00.000Z",
  updated_at: "2026-08-30T10:00:00.000Z",
};

describe("admin collection actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: ADMIN_ID, displayName: "Admin" });
    mocks.getMediaAssetsByIds.mockResolvedValue([]);
    mocks.indexMediaAssets.mockReturnValue({});
  });

  it("validates before auth and normalizes a service before insert", async () => {
    const builder = query(baseService);
    mocks.createServerSupabaseClient.mockResolvedValue({ from: vi.fn().mockReturnValue(builder) });
    mocks.mapServiceDetail.mockReturnValue({ id: RECORD_ID, name: "Interior direction" });

    const result = await createService({
      slug: "  interior-direction ",
      name: " Interior direction ",
      shortDescription: " A considered design direction. ",
      fullDescription: " ",
      idealClient: " ",
      scope: [" Strategy ", ""],
      deliverables: [" Concept package "],
      included: [],
      excluded: [],
      typicalProjectTypes: [],
      mediaId: null,
      sortOrder: 0,
      featured: false,
      status: "draft",
    });

    expect(result).toEqual({
      ok: true,
      data: { id: RECORD_ID, name: "Interior direction" },
      message: "Service created.",
    });
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "interior-direction",
        name: "Interior direction",
        short_description: "A considered design direction.",
        full_description: null,
        scope: ["Strategy"],
      }),
    );

    const invalid = await createService({
      slug: "not valid",
      name: "",
      shortDescription: "",
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
      status: "draft",
    });
    expect(invalid.ok).toBe(false);
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
  });

  it("uses the process, exploration, and testimonial table contracts", async () => {
    const processBuilder = query({
      ...baseService,
      step_no: 1,
      title: "Listen",
      description: "Listen",
    });
    const explorationBuilder = query({
      ...baseService,
      slug: "quiet-materials",
      title: "Quiet materials",
      category: "Material study",
      description: null,
      year: null,
      cover_media_id: null,
    });
    const testimonialBuilder = query({
      ...baseService,
      client_name: "A Client",
      client_role: null,
      project_name: null,
      quote: "A clear process.",
    });
    mocks.mapProcessStep.mockReturnValue({ id: RECORD_ID });
    mocks.mapExploration.mockReturnValue({ id: RECORD_ID });
    mocks.mapTestimonial.mockReturnValue({ id: RECORD_ID });

    mocks.createServerSupabaseClient
      .mockResolvedValueOnce({ from: vi.fn().mockReturnValue(processBuilder) })
      .mockResolvedValueOnce({ from: vi.fn().mockReturnValue(explorationBuilder) })
      .mockResolvedValueOnce({ from: vi.fn().mockReturnValue(testimonialBuilder) });

    await createProcessStep({
      stepNo: 1,
      title: " Listen ",
      description: " Understand the brief. ",
      mediaId: null,
      sortOrder: 0,
      status: "draft",
    });
    await createExploration({
      slug: "quiet-materials",
      title: "Quiet materials",
      category: "Material study",
      description: " ",
      year: null,
      coverMediaId: null,
      sortOrder: 0,
      status: "draft",
    });
    await createTestimonial({
      clientName: " A Client ",
      clientRole: " ",
      projectName: " ",
      quote: " A clear process. ",
      sortOrder: 0,
      featured: false,
      status: "draft",
    });

    expect(processBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Listen", description: "Understand the brief." }),
    );
    expect(explorationBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ description: null, slug: "quiet-materials" }),
    );
    expect(testimonialBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        client_name: "A Client",
        client_role: null,
        quote: "A clear process.",
      }),
    );
  });

  it("delegates exploration ordering to the admin-only RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({ rpc });

    await expect(reorderExplorations([RECORD_ID])).resolves.toEqual({
      ok: true,
      message: "Exploration order saved.",
    });
    expect(rpc).toHaveBeenCalledWith("reorder_explorations", { exploration_ids: [RECORD_ID] });
  });
});
