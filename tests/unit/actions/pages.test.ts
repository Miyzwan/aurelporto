import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  mapPage: vi.fn(),
  mapPageSection: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));
vi.mock("@/lib/data/pages", () => ({
  mapPage: mocks.mapPage,
  mapPageSection: mocks.mapPageSection,
}));

import {
  createPageSection,
  deletePageSection,
  reorderPageSections,
  togglePageSection,
  updatePageMetadata,
  updatePageSection,
} from "@/lib/actions/pages";
import type { Page, PageSection } from "@/types/content";

const PAGE_ID = "00000000-0000-4000-8000-000000000001";
const SECTION_ID = "00000000-0000-4000-8000-000000000002";
const SECTION_ID_2 = "00000000-0000-4000-8000-000000000003";

function query<T>(data: T, error: unknown = null) {
  const builder = {
    data,
    error,
    delete: vi.fn(),
    eq: vi.fn(),
    insert: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
    update: vi.fn(),
  };
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.single.mockResolvedValue({ data, error });
  return builder;
}

const samplePage: Page = {
  id: PAGE_ID,
  slug: "about",
  title: "About the Studio",
  navLabel: "About",
  seoTitle: "About Gabrielle Aurelia",
  seoDescription: "Interior design studio profile.",
  ogMediaId: null,
  status: "published",
};

const sampleSection: PageSection = {
  id: SECTION_ID,
  pageId: PAGE_ID,
  sectionKey: "intro",
  sectionType: "rich_text",
  content: { title: "Our Ethos", body: "Spaces designed for intentional living." },
  settings: {},
  sortOrder: 0,
  isEnabled: true,
  status: "published",
};

describe("page and section actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: "admin-1", displayName: "Admin" });
  });

  it("updates page metadata", async () => {
    const builder = query({ ...samplePage, title: "About Gabrielle" });
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });
    mocks.mapPage.mockReturnValue({ ...samplePage, title: "About Gabrielle" });

    const result = await updatePageMetadata({
      id: PAGE_ID,
      slug: "about",
      title: "About Gabrielle",
      navLabel: "About",
      seoTitle: "About Gabrielle",
      seoDescription: "Studio profile.",
      ogMediaId: null,
      status: "published",
    });

    expect(result.ok).toBe(true);
    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: "About Gabrielle", slug: "about" }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/pages/about");
  });

  it("creates a page section validated by section-registry", async () => {
    const builder = query({ ...sampleSection, pages: { slug: "about" } });
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });
    mocks.mapPageSection.mockReturnValue(sampleSection);

    const result = await createPageSection({
      pageId: PAGE_ID,
      sectionKey: "intro",
      sectionType: "rich_text",
      content: { title: "Our Ethos", body: "Spaces designed for intentional living." },
      isEnabled: true,
      status: "published",
    });

    expect(result.ok).toBe(true);
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        page_id: PAGE_ID,
        section_key: "intro",
        section_type: "rich_text",
      }),
    );
  });

  it("updates a page section", async () => {
    const builder = query({ ...sampleSection, pages: { slug: "about" } });
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });
    mocks.mapPageSection.mockReturnValue(sampleSection);

    const result = await updatePageSection({
      id: SECTION_ID,
      pageId: PAGE_ID,
      sectionKey: "intro",
      sectionType: "rich_text",
      content: { title: "Our Ethos", body: "Updated narrative body." },
      isEnabled: true,
      status: "published",
    });

    expect(result.ok).toBe(true);
    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ section_key: "intro" }));
  });

  it("toggles page section visibility", async () => {
    const builder = query({ ...sampleSection, is_enabled: false, pages: { slug: "about" } });
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });
    mocks.mapPageSection.mockReturnValue({ ...sampleSection, isEnabled: false });

    const result = await togglePageSection(SECTION_ID, false);

    expect(result.ok).toBe(true);
    expect(builder.update).toHaveBeenCalledWith({ is_enabled: false });
  });

  it("deletes a page section", async () => {
    const builder = query({ pages: { slug: "about" } });
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await deletePageSection(SECTION_ID);

    expect(result).toEqual({
      ok: true,
      data: { id: SECTION_ID },
      message: "Page section deleted.",
    });
  });

  it("reorders page sections using RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({ rpc });

    const result = await reorderPageSections({
      pageId: PAGE_ID,
      sectionIds: [SECTION_ID, SECTION_ID_2],
    });

    expect(result).toEqual({ ok: true, message: "Section order updated." });
    expect(rpc).toHaveBeenCalledWith("reorder_page_sections", {
      p_page_id: PAGE_ID,
      p_section_ids: [SECTION_ID, SECTION_ID_2],
    });
  });
});
