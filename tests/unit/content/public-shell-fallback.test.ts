import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPublicSiteSettings: vi.fn(),
  getPublicNavigation: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/data/site", () => ({
  getPublicSiteSettings: mocks.getPublicSiteSettings,
  getPublicNavigation: mocks.getPublicNavigation,
}));

import { getPublicShellDataWithFallback, PUBLIC_SHELL_FALLBACK } from "@/lib/content/public-shell";

// A deployment once shipped with an empty navbar because the layout swallowed a
// failed shell read and the failure was then frozen into the static prerender.
describe("public shell fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PHASE;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.NEXT_PHASE;
    vi.restoreAllMocks();
  });

  it("returns the real shell when both reads succeed", async () => {
    mocks.getPublicSiteSettings.mockResolvedValue({ siteName: "Studio", professionalRole: "Role" });
    mocks.getPublicNavigation.mockResolvedValue([
      {
        id: "n1",
        label: "Projects",
        href: "/projects",
        placement: "header",
        sortOrder: 0,
        isVisible: true,
        targetBlank: false,
      },
    ]);

    const shell = await getPublicShellDataWithFallback();

    expect(shell.siteSettings.siteName).toBe("Studio");
    expect(shell.headerNavigation).toHaveLength(1);
  });

  it("degrades to an empty shell at runtime and logs the cause", async () => {
    const failure = new Error("navigation read failed");
    mocks.getPublicSiteSettings.mockResolvedValue({ siteName: "Studio", professionalRole: "Role" });
    mocks.getPublicNavigation.mockRejectedValue(failure);

    const shell = await getPublicShellDataWithFallback();

    expect(shell).toEqual(PUBLIC_SHELL_FALLBACK);
    expect(shell.headerNavigation).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "[public-shell] falling back to an empty shell:",
      failure,
    );
  });

  it("fails the production build instead of prerendering a navless site", async () => {
    process.env.NEXT_PHASE = "phase-production-build";
    const failure = new Error('relation "public.navigation_items" does not exist');
    mocks.getPublicSiteSettings.mockResolvedValue({ siteName: "Studio", professionalRole: "Role" });
    mocks.getPublicNavigation.mockRejectedValue(failure);

    await expect(getPublicShellDataWithFallback()).rejects.toThrow(
      /could not read site settings or navigation during the production build/,
    );
    await expect(getPublicShellDataWithFallback()).rejects.toMatchObject({ cause: failure });
  });
});
