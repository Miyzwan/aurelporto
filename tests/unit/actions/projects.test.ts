import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  mapAdminProjectDetail: vi.fn(),
  parseProjectSectionContent: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));
vi.mock("@/lib/data/projects", () => ({
  mapAdminProjectDetail: mocks.mapAdminProjectDetail,
}));

import {
  createProject,
  createProjectSection,
  deleteProject,
  deleteProjectSection,
  reorderProjects,
  reorderProjectSections,
  setProjectStatus,
  toggleProjectSection,
  updateProject,
  updateProjectSection,
} from "@/lib/actions/projects";
import type { AdminProjectDetail, ProjectMutationInput } from "@/types/content";

const PROJECT_ID = "00000000-0000-4000-8000-000000000001";
const PROJECT_ID_2 = "00000000-0000-4000-8000-000000000002";
const SECTION_ID = "00000000-0000-4000-8000-000000000010";
const SECTION_ID_2 = "00000000-0000-4000-8000-000000000011";
const MEDIA_ID = "00000000-0000-4000-8000-000000000099";

function query<T>(data: T, error: unknown = null) {
  const builder = {
    data,
    error,
    delete: vi.fn(),
    eq: vi.fn(),
    in: vi.fn(),
    insert: vi.fn(),
    order: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
    update: vi.fn(),
  };
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.in.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.single.mockResolvedValue({ data, error });
  return builder;
}

const sampleProjectInput: ProjectMutationInput = {
  slug: "kyoto-residence",
  title: "Kyoto Residence",
  year: 2026,
  location: "Kyoto, Japan",
  projectType: "Private Residence",
  areaSqm: 280,
  projectStatus: "completed",
  clientType: "Private",
  designRole: ["Interior Architecture"],
  services: ["Spatial Planning", "Materiality"],
  summary: "A contemplative retreat designed around internal courtyards.",
  heroMediaId: MEDIA_ID,
  featured: true,
  featuredOrder: 1,
  sortOrder: 0,
  seoTitle: "Kyoto Residence | Gabrielle Aurelia",
  seoDescription: "Residential case study in Kyoto.",
  ogMediaId: null,
  status: "draft",
};

const sampleAdminProject: AdminProjectDetail = {
  id: PROJECT_ID,
  ...sampleProjectInput,
  heroMedia: null,
  ogMedia: null,
  heroMediaId: MEDIA_ID,
  ogMediaId: null,
};

describe("projects actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: "admin-1", displayName: "Admin" });
  });

  it("creates a project under admin auth", async () => {
    const rawRow = { id: PROJECT_ID, ...sampleProjectInput };
    const builder = query(rawRow);
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });
    mocks.mapAdminProjectDetail.mockReturnValue(sampleAdminProject);

    const result = await createProject(sampleProjectInput);

    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(result).toEqual({
      ok: true,
      data: sampleAdminProject,
      message: "Project created.",
    });
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Kyoto Residence",
        slug: "kyoto-residence",
      }),
    );
  });

  it("updates a project and revalidates preview and detail paths", async () => {
    const rawRow = { id: PROJECT_ID, ...sampleProjectInput, title: "Kyoto Villa" };
    const builder = query(rawRow);
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });
    mocks.mapAdminProjectDetail.mockReturnValue({ ...sampleAdminProject, title: "Kyoto Villa" });

    const result = await updateProject({
      ...sampleProjectInput,
      id: PROJECT_ID,
      title: "Kyoto Villa",
    });

    expect(result.ok).toBe(true);
    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ title: "Kyoto Villa" }));
    expect(builder.eq).toHaveBeenCalledWith("id", PROJECT_ID);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/projects/${PROJECT_ID}`);
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/preview/projects/${PROJECT_ID}`);
  });

  it("enforces publishing constraints (hero media required)", async () => {
    const result = await updateProject({
      ...sampleProjectInput,
      id: PROJECT_ID,
      status: "published",
      heroMediaId: null,
    });

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("Expected publishing validation to fail");
    expect(result.fieldErrors?.heroMediaId).toBeDefined();
  });

  it("updates project status with setProjectStatus", async () => {
    const rawRow = { id: PROJECT_ID, status: "published", hero_media_id: MEDIA_ID };
    const builder = query(rawRow);
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });
    mocks.mapAdminProjectDetail.mockReturnValue({ ...sampleAdminProject, status: "published" });

    const result = await setProjectStatus(PROJECT_ID, "published");

    expect(result.ok).toBe(true);
    expect(builder.update).toHaveBeenCalledWith({ status: "published" });
  });

  it("deletes a project", async () => {
    const builder = query({ slug: "kyoto-residence" });
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await deleteProject(PROJECT_ID);

    expect(result).toEqual({
      ok: true,
      data: { id: PROJECT_ID },
      message: "Project deleted.",
    });
  });

  it("reorders projects using RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({ rpc });

    const result = await reorderProjects([PROJECT_ID, PROJECT_ID_2]);

    expect(result).toEqual({ ok: true, message: "Project order updated." });
    expect(rpc).toHaveBeenCalledWith("reorder_projects", {
      project_ids: [PROJECT_ID, PROJECT_ID_2],
    });
  });

  it("creates a project section", async () => {
    const rawSection = {
      id: SECTION_ID,
      project_id: PROJECT_ID,
      section_key: "overview",
      section_type: "overview",
      title: "Overview",
      content: { body: "Project narrative", mediaIds: [] },
      sort_order: 0,
      is_enabled: true,
      projects: { slug: "kyoto-residence" },
    };
    const builder = query(rawSection);
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await createProjectSection({
      projectId: PROJECT_ID,
      sectionKey: "overview",
      sectionType: "overview",
      title: "Overview",
      content: { body: "Project narrative", mediaIds: [] },
      isEnabled: true,
    });

    expect(result.ok).toBe(true);
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        section_key: "overview",
        section_type: "overview",
      }),
    );
  });

  it("updates a project section", async () => {
    const rawSection = {
      id: SECTION_ID,
      project_id: PROJECT_ID,
      section_key: "overview",
      section_type: "overview",
      title: "Updated Title",
      content: { body: "Updated narrative", mediaIds: [] },
      sort_order: 0,
      is_enabled: true,
      projects: { slug: "kyoto-residence" },
    };
    const builder = query(rawSection);
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await updateProjectSection({
      id: SECTION_ID,
      projectId: PROJECT_ID,
      sectionKey: "overview",
      sectionType: "overview",
      title: "Updated Title",
      content: { body: "Updated narrative", mediaIds: [] },
      isEnabled: true,
    });

    expect(result.ok).toBe(true);
    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Updated Title" }),
    );
  });

  it("toggles project section visibility", async () => {
    const builder = query({
      project_id: PROJECT_ID,
      is_enabled: false,
      projects: { slug: "kyoto-residence" },
    });
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await toggleProjectSection(SECTION_ID, false);

    expect(result).toEqual({
      ok: true,
      data: { id: SECTION_ID, isEnabled: false },
      message: "Section disabled.",
    });
  });

  it("deletes a project section", async () => {
    const builder = query({ project_id: PROJECT_ID, projects: { slug: "kyoto-residence" } });
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await deleteProjectSection(SECTION_ID);

    expect(result).toEqual({
      ok: true,
      data: { id: SECTION_ID },
      message: "Section deleted.",
    });
  });

  it("reorders project sections using RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({ rpc });

    const result = await reorderProjectSections({
      projectId: PROJECT_ID,
      sectionIds: [SECTION_ID, SECTION_ID_2],
    });

    expect(result).toEqual({ ok: true, message: "Section order updated." });
    expect(rpc).toHaveBeenCalledWith("reorder_project_sections", {
      p_project_id: PROJECT_ID,
      p_section_ids: [SECTION_ID, SECTION_ID_2],
    });
  });

  it("fails when user is not authorized as admin", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("Unauthorized"));

    const result = await createProject(sampleProjectInput);

    expect(result).toEqual({ ok: false, formError: "Could not create project." });
  });
});
