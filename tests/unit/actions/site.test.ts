import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  mapAdminSiteSettings: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));
vi.mock("@/lib/data/site", () => ({
  mapAdminSiteSettings: mocks.mapAdminSiteSettings,
}));

import { updateSiteSettings } from "@/lib/actions/site";
import type { SiteSettingsMutationInput } from "@/types/content";

function query<T>(data: T, error: unknown = null) {
  const builder = {
    data,
    error,
    eq: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
    update: vi.fn(),
  };
  builder.eq.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.single.mockResolvedValue({ data, error });
  return builder;
}

const sampleInput: SiteSettingsMutationInput = {
  siteName: "Gabrielle Aurelia",
  professionalRole: "Interior Designer",
  location: "Jakarta, Indonesia",
  serviceArea: "Jakarta · Bandung · Bali",
  email: "gabrielle@example.com",
  phone: "+62 812 3456 7890",
  whatsapp: "+62 812 3456 7890",
  socialLinks: [{ label: "Instagram", href: "https://instagram.com/aurel" }],
  footerText: "© 2026 Gabrielle Aurelia.",
  defaultSeoTitle: "Gabrielle Aurelia — Interior Design Studio",
  defaultSeoDescription: "Selected interior direction and spatial design work.",
  defaultOgMediaId: null,
  inquiryConfig: {
    projectTypes: ["Hospitality", "Residential"],
    projectStatuses: ["Planning", "Execution"],
    timelineOptions: ["1–3 Months", "3–6 Months"],
    budgetOptions: ["$10k - $25k", "$25k - $50k"],
    showBudgetField: true,
    showPhoneField: true,
    successTitle: "Inquiry received",
    successBody: "Thank you for reaching out.",
  },
};

describe("updateSiteSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: "admin-1", displayName: "Admin" });
  });

  it("updates site settings and revalidates routes", async () => {
    const rawDbRow = { id: 1, ...sampleInput };
    const builder = query(rawDbRow);
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(builder),
    });
    mocks.mapAdminSiteSettings.mockReturnValue(sampleInput);

    const result = await updateSiteSettings(sampleInput);

    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(result).toEqual({
      ok: true,
      data: sampleInput,
      message: "Site settings updated.",
    });

    expect(builder.update).toHaveBeenCalledWith(
      expect.objectContaining({
        site_name: "Gabrielle Aurelia",
        professional_role: "Interior Designer",
      }),
    );
    expect(builder.eq).toHaveBeenCalledWith("id", 1);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/site");
  });

  it("returns validation field errors on invalid inputs", async () => {
    const result = await updateSiteSettings({
      ...sampleInput,
      siteName: "",
      email: "not-an-email",
    });

    if (result.ok) throw new Error("Expected updateSiteSettings to fail.");
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.site_name).toBeDefined();
    expect(result.fieldErrors?.email).toBeDefined();
    expect(mocks.requireAdmin).not.toHaveBeenCalled();
  });

  it("fails if caller is not an authenticated admin", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("Unauthorized"));

    const result = await updateSiteSettings(sampleInput);

    expect(result).toEqual({ ok: false, formError: "Could not update site settings." });
  });
});
