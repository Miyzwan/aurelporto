import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  mapMediaAsset: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));
vi.mock("@/lib/data/media", () => ({
  MEDIA_COLUMNS: "media-columns",
  mapMediaAsset: mocks.mapMediaAsset,
}));

import { createMediaAsset, hardDeleteMediaAsset, setMediaAssetArchived } from "@/lib/actions/media";

const MEDIA_ID = "00000000-0000-4000-8000-000000000001";
const STORAGE_PATH = "portfolio/2026/00000000-0000-4000-8000-000000000002-studio-detail.jpg";

function query<T>(data: T, error: unknown = null) {
  const builder = {
    data,
    error,
    delete: vi.fn(),
    eq: vi.fn(),
    insert: vi.fn(),
    maybeSingle: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
    then: vi.fn(),
    update: vi.fn(),
  };
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.maybeSingle.mockResolvedValue({ data, error });
  builder.single.mockResolvedValue({ data, error });
  builder.then.mockImplementation((resolve: (value: { data: T; error: unknown }) => unknown) =>
    Promise.resolve(resolve({ data, error })),
  );
  return builder;
}

function uploadInput() {
  return {
    bucket: "portfolio-public" as const,
    storagePath: STORAGE_PATH,
    mediaType: "image" as const,
    altText: "  Studio detail  ",
    caption: "  Oak shelving  ",
    photographer: null,
    width: 1600,
    height: 1000,
    posterPath: null,
    mimeType: "image/jpeg",
    fileSizeBytes: 2400,
  };
}

describe("media actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: MEDIA_ID, displayName: "Admin" });
  });

  it("inserts normalized metadata after an authenticated admin upload", async () => {
    const row = {
      id: MEDIA_ID,
      bucket: "portfolio-public",
      storage_path: STORAGE_PATH,
      media_type: "image",
      alt_text: "Studio detail",
      caption: "Oak shelving",
      photographer: null,
      width: 1600,
      height: 1000,
      poster_path: null,
      mime_type: "image/jpeg",
      file_size_bytes: 2400,
      is_archived: false,
      created_by: MEDIA_ID,
      created_at: "2026-08-30T10:00:00.000Z",
      updated_at: "2026-08-30T10:00:00.000Z",
    };
    const insertQuery = query(row);
    const storage = { from: vi.fn() };
    const supabase = { from: vi.fn().mockReturnValue(insertQuery), storage };
    mocks.createServerSupabaseClient.mockResolvedValue(supabase);
    mocks.mapMediaAsset.mockReturnValue({ id: MEDIA_ID, altText: "Studio detail" });

    await expect(createMediaAsset(uploadInput())).resolves.toEqual({
      ok: true,
      data: { id: MEDIA_ID, altText: "Studio detail" },
      message: "Media uploaded to the library.",
    });
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        alt_text: "Studio detail",
        caption: "Oak shelving",
        created_by: MEDIA_ID,
        is_archived: false,
      }),
    );
  });

  it("cleans up the object when metadata insertion fails", async () => {
    const storage = { from: vi.fn() };
    const remove = vi.fn().mockResolvedValue({ data: [], error: null });
    storage.from.mockReturnValue({ remove });
    const supabase = {
      from: vi.fn().mockReturnValue(query(null, new Error("insert failed"))),
      storage,
    };
    mocks.createServerSupabaseClient.mockResolvedValue(supabase);

    await expect(createMediaAsset(uploadInput())).resolves.toMatchObject({
      ok: false,
      formError: expect.stringContaining("cleaned up"),
    });
    expect(remove).toHaveBeenCalledWith([STORAGE_PATH]);
  });

  it("archives and restores metadata without touching the Storage object", async () => {
    const updateQuery = query({ id: MEDIA_ID, is_archived: true });
    const supabase = { from: vi.fn().mockReturnValue(updateQuery) };
    mocks.createServerSupabaseClient.mockResolvedValue(supabase);

    await expect(setMediaAssetArchived({ id: MEDIA_ID, isArchived: true })).resolves.toMatchObject({
      ok: true,
      data: { id: MEDIA_ID, isArchived: true },
    });
    expect(updateQuery.update).toHaveBeenCalledWith({ is_archived: true });
  });

  it("blocks permanent deletion while any direct or JSON reference remains", async () => {
    const assetQuery = query({
      id: MEDIA_ID,
      bucket: "portfolio-public",
      storage_path: STORAGE_PATH,
    });
    const pagesQuery = query([{ id: "page-1", og_media_id: MEDIA_ID }]);
    const empty = () => query([]);
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "media_assets") return assetQuery;
        if (table === "pages") return pagesQuery;
        return empty();
      }),
      storage: { from: vi.fn() },
    };
    mocks.createServerSupabaseClient.mockResolvedValue(supabase);

    await expect(hardDeleteMediaAsset(MEDIA_ID)).resolves.toMatchObject({
      ok: false,
      formError: expect.stringContaining("page (page-1)"),
    });
  });
});
