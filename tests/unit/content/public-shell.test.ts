import { beforeEach, describe, expect, it, vi } from "vitest";

import { RepositoryError } from "@/lib/data/errors";
import { placeholderSiteSettings } from "@/lib/content/placeholder-shell";
import type { NavigationItem, SiteSettings } from "@/types/content";

const mocks = vi.hoisted(() => ({
  getPublicNavigation: vi.fn(),
  getPublicSiteSettings: vi.fn(),
}));

vi.mock("@/lib/data/site", () => mocks);

import { getPublicShellData } from "@/lib/content/public-shell";

const settings: SiteSettings = {
  siteName: "Database Name",
  professionalRole: "Database Role",
  location: null,
  serviceArea: null,
  email: null,
  phone: null,
  whatsapp: null,
  socialLinks: [],
  footerText: "Database footer",
};

function navigationItem(
  overrides: Partial<NavigationItem> & Pick<NavigationItem, "id" | "placement" | "href">,
): NavigationItem {
  return {
    label: overrides.id,
    sortOrder: 0,
    isVisible: true,
    targetBlank: false,
    ...overrides,
  };
}

describe("public shell data adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublicSiteSettings.mockResolvedValue(settings);
    mocks.getPublicNavigation.mockResolvedValue([]);
  });

  it("maps database navigation into header, footer, social, and CTA slots", async () => {
    mocks.getPublicNavigation.mockResolvedValue([
      navigationItem({
        id: "header-projects",
        label: "Projects",
        placement: "header",
        href: "/projects",
      }),
      navigationItem({
        id: "header-contact",
        label: "Say hello",
        placement: "header",
        href: "/contact",
        targetBlank: true,
      }),
      navigationItem({ id: "footer-about", label: "About", placement: "footer", href: "/about" }),
      navigationItem({
        id: "social-linkedin",
        label: "LinkedIn",
        placement: "social",
        href: "https://example.com/linkedin",
        targetBlank: true,
      }),
    ]);

    await expect(getPublicShellData()).resolves.toEqual({
      siteSettings: settings,
      headerNavigation: [
        navigationItem({
          id: "header-projects",
          label: "Projects",
          placement: "header",
          href: "/projects",
        }),
      ],
      footerNavigation: [
        navigationItem({ id: "footer-about", label: "About", placement: "footer", href: "/about" }),
      ],
      socialNavigation: [
        navigationItem({
          id: "social-linkedin",
          label: "LinkedIn",
          placement: "social",
          href: "https://example.com/linkedin",
          targetBlank: true,
        }),
      ],
      cta: { label: "Say hello", href: "/contact", targetBlank: true },
    });
  });

  it("uses the safe fixture only when the site settings singleton is missing", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.getPublicSiteSettings.mockRejectedValue(
      new RepositoryError("not_found", "site settings"),
    );

    await expect(getPublicShellData()).resolves.toMatchObject({
      siteSettings: placeholderSiteSettings,
      headerNavigation: [],
      footerNavigation: [],
      socialNavigation: [],
      cta: null,
    });
    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("site_settings singleton is missing"),
      expect.any(RepositoryError),
    );
    log.mockRestore();
  });

  it("does not hide database failures behind the missing-singleton fallback", async () => {
    const error = new RepositoryError("database", "site settings");
    mocks.getPublicSiteSettings.mockRejectedValue(error);

    await expect(getPublicShellData()).rejects.toBe(error);
  });
});
