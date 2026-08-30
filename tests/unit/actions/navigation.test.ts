import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  mapNavigationItem: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));
vi.mock("@/lib/data/site", () => ({
  mapNavigationItem: mocks.mapNavigationItem,
}));

import {
  createNavigationItem,
  deleteNavigationItem,
  reorderNavigationItems,
  updateNavigationItem,
} from "@/lib/actions/navigation";
import type { NavigationItem, NavigationItemMutationInput } from "@/types/content";

const ITEM_ID = "00000000-0000-4000-8000-000000000001";
const ITEM_ID_2 = "00000000-0000-4000-8000-000000000002";

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

const sampleItem: NavigationItem = {
  id: ITEM_ID,
  label: "Projects",
  href: "/projects",
  placement: "header",
  sortOrder: 0,
  isVisible: true,
  targetBlank: false,
};

describe("navigation actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: "admin-1", displayName: "Admin" });
  });

  it("creates a navigation item under admin auth", async () => {
    const builder = query(sampleItem);
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });
    mocks.mapNavigationItem.mockReturnValue(sampleItem);

    const input: NavigationItemMutationInput = {
      label: "Projects",
      href: "/projects",
      placement: "header",
      sortOrder: 0,
      isVisible: true,
      targetBlank: false,
    };

    const result = await createNavigationItem(input);

    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(result).toEqual({
      ok: true,
      data: sampleItem,
      message: "Navigation item created.",
    });
    expect(builder.insert).toHaveBeenCalledWith({
      label: "Projects",
      href: "/projects",
      placement: "header",
      sort_order: 0,
      is_visible: true,
      target_blank: false,
    });
  });

  it("updates a navigation item", async () => {
    const builder = query(sampleItem);
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });
    mocks.mapNavigationItem.mockReturnValue({ ...sampleItem, label: "Work" });

    const result = await updateNavigationItem({
      id: ITEM_ID,
      label: "Work",
      href: "/projects",
      placement: "header",
      sortOrder: 0,
      isVisible: true,
      targetBlank: false,
    });

    expect(result.ok).toBe(true);
    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ label: "Work" }));
    expect(builder.eq).toHaveBeenCalledWith("id", ITEM_ID);
  });

  it("deletes a navigation item", async () => {
    const builder = query(null);
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });

    const result = await deleteNavigationItem(ITEM_ID);

    expect(result).toEqual({
      ok: true,
      data: { id: ITEM_ID },
      message: "Navigation item deleted.",
    });
    expect(builder.delete).toHaveBeenCalledOnce();
    expect(builder.eq).toHaveBeenCalledWith("id", ITEM_ID);
  });

  it("reorders navigation items via RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({ error: null });
    mocks.createServerSupabaseClient.mockResolvedValue({ rpc });

    const result = await reorderNavigationItems([ITEM_ID, ITEM_ID_2]);

    expect(result).toEqual({ ok: true, message: "Navigation order updated." });
    expect(rpc).toHaveBeenCalledWith("reorder_navigation_items", {
      item_ids: [ITEM_ID, ITEM_ID_2],
    });
  });
});
