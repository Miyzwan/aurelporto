import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  publicClient: { from: vi.fn() },
  createPublicSupabaseClient: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/public", () => ({
  createPublicSupabaseClient: mocks.createPublicSupabaseClient,
}));

import { getPublishedPageSections } from "@/lib/data/pages";
import { ContentValidationError } from "@/lib/validation/errors";

const PAGE_ID = "00000000-0000-0000-0000-000000000001";
const SECTION_ID = "00000000-0000-0000-0000-000000000002";

function queryResult<T>(data: T, error: null = null) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.maybeSingle.mockResolvedValue({ data, error });
  query.then.mockImplementation((resolve: (value: { data: T; error: null }) => unknown) =>
    Promise.resolve(resolve({ data, error })),
  );

  return query;
}

describe("content repositories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createPublicSupabaseClient.mockReturnValue(mocks.publicClient);
  });

  it("returns Zod-parsed published page sections", async () => {
    const page = {
      id: PAGE_ID,
      slug: "home",
      title: "Home",
      nav_label: "Home",
      seo_title: null,
      seo_description: null,
      og_media_id: null,
      status: "published" as const,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };
    const section = {
      id: SECTION_ID,
      page_id: PAGE_ID,
      section_key: "intro",
      section_type: "rich_text",
      content: { title: "About the work", body: "A considered practice." },
      settings: {},
      sort_order: 0,
      is_enabled: true,
      status: "published" as const,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };
    mocks.publicClient.from
      .mockReturnValueOnce(queryResult(page))
      .mockReturnValueOnce(queryResult([section]));

    await expect(getPublishedPageSections("home")).resolves.toEqual([
      expect.objectContaining({
        id: SECTION_ID,
        sectionType: "rich_text",
        content: { title: "About the work", body: "A considered practice." },
      }),
    ]);
  });

  it("fails with the malformed section record ID", async () => {
    const page = {
      id: PAGE_ID,
      slug: "home",
      title: "Home",
      nav_label: null,
      seo_title: null,
      seo_description: null,
      og_media_id: null,
      status: "published" as const,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };
    const malformedSection = {
      id: SECTION_ID,
      page_id: PAGE_ID,
      section_key: "hero",
      section_type: "home_hero",
      content: { headline: 42 },
      settings: {},
      sort_order: 0,
      is_enabled: true,
      status: "published" as const,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };
    mocks.publicClient.from
      .mockReturnValueOnce(queryResult(page))
      .mockReturnValueOnce(queryResult([malformedSection]));

    await expect(getPublishedPageSections("home")).rejects.toMatchObject({
      name: "ContentValidationError",
      recordId: SECTION_ID,
    } satisfies Partial<ContentValidationError>);
  });
});
