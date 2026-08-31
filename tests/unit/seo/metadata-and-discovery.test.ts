import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getPublicSiteSettings: vi.fn(),
  getPublicMediaAssetsByIds: vi.fn(),
  getPublishedPages: vi.fn(),
  getPublishedPageWithSections: vi.fn(),
  getPublishedProjectBySlug: vi.fn(),
  getPublishedProjects: vi.fn(),
  getPublishedExplorations: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/data/site", () => ({
  getPublicSiteSettings: mocks.getPublicSiteSettings,
}));
vi.mock("@/lib/data/media", () => ({
  getPublicMediaAssetsByIds: mocks.getPublicMediaAssetsByIds,
}));
vi.mock("@/lib/data/pages", () => ({
  getPublishedPages: mocks.getPublishedPages,
  getPublishedPageWithSections: mocks.getPublishedPageWithSections,
}));
vi.mock("@/lib/data/projects", () => ({
  getPublishedProjectBySlug: mocks.getPublishedProjectBySlug,
  getPublishedProjects: mocks.getPublishedProjects,
}));
vi.mock("@/lib/data/explorations", () => ({
  getPublishedExplorations: mocks.getPublishedExplorations,
}));

import { absoluteUrl, getSiteBaseUrl, resolveAbsoluteMediaUrl } from "@/lib/seo/site-url";
import {
  generatePageMetadata,
  generateProjectMetadata,
  generateRootMetadata,
  getSiteSeoDefaults,
} from "@/lib/seo/metadata";
import {
  buildBreadcrumbSchema,
  buildPersonOrOrganizationSchema,
  buildProjectSchema,
  buildWebSiteSchema,
} from "@/lib/seo/structured-data";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import type { MediaAsset, ProjectDetail, SiteSettings } from "@/types/content";

const sampleSiteSettings: SiteSettings = {
  siteName: "Gabrielle Aurelia",
  professionalRole: "Interior Designer",
  location: "Jakarta, Indonesia",
  serviceArea: "Jakarta · Bali",
  email: "contact@gabrielleaurelia.com",
  phone: "+62 812 3456 7890",
  whatsapp: "+62 812 3456 7890",
  socialLinks: [{ label: "Instagram", href: "https://instagram.com/gabrielleaurelia" }],
  footerText: "© 2026 Gabrielle Aurelia",
  defaultSeoTitle: "Gabrielle Aurelia — Spatial Design",
  defaultSeoDescription: "Editorial interior architecture practice in Jakarta.",
  defaultOgMediaId: "media-og-default",
};

const sampleMedia: MediaAsset = {
  id: "media-og-default",
  bucket: "portfolio-public",
  storagePath: "portfolio/2026/00000000-0000-4000-8000-000000000001-og.jpg",
  mediaType: "image",
  altText: "Studio OpenGraph",
  caption: null,
  photographer: null,
  width: 1200,
  height: 630,
  posterPath: null,
  mimeType: "image/jpeg",
};

const sampleProject: ProjectDetail = {
  id: "00000000-0000-4000-8000-000000000010",
  slug: "menteng-sanctuary",
  title: "Menteng Sanctuary",
  year: 2025,
  location: "Jakarta, Indonesia",
  projectType: "Private Residence",
  areaSqm: 450,
  projectStatus: "completed",
  clientType: "Private Family",
  designRole: ["Interior Architecture"],
  services: ["Spatial Planning"],
  summary: "A light-filled residential sanctuary embracing travertine and teak.",
  heroMedia: sampleMedia,
  featured: true,
  featuredOrder: 1,
  sortOrder: 0,
  seoTitle: "Menteng Sanctuary | Case Study",
  seoDescription: "Editorial case study exploring spatial tranquility in Menteng.",
  ogMedia: null,
};

describe("SEO, Metadata, and Discovery (INT-015)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SITE_URL = "https://gabrielleaurelia.com";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";

    mocks.getPublicSiteSettings.mockResolvedValue(sampleSiteSettings);
    mocks.getPublicMediaAssetsByIds.mockResolvedValue([sampleMedia]);
    mocks.getPublishedPages.mockResolvedValue([
      { id: "p-home", slug: "home", title: "Home", status: "published" },
      { id: "p-projects", slug: "projects", title: "Projects", status: "published" },
      { id: "p-services", slug: "services", title: "Services", status: "published" },
      { id: "p-process", slug: "process", title: "Process", status: "published" },
      { id: "p-explorations", slug: "explorations", title: "Explorations", status: "published" },
      { id: "p-about", slug: "about", title: "About", status: "published" },
      { id: "p-contact", slug: "contact", title: "Contact", status: "published" },
    ]);
    mocks.getPublishedProjects.mockResolvedValue([sampleProject]);
    mocks.getPublishedExplorations.mockResolvedValue([]);
  });

  describe("Site URL resolution", () => {
    it("returns configured base URL without trailing slashes", () => {
      expect(getSiteBaseUrl()).toBe("https://gabrielleaurelia.com");
      expect(absoluteUrl("/projects")).toBe("https://gabrielleaurelia.com/projects");
      expect(absoluteUrl("contact")).toBe("https://gabrielleaurelia.com/contact");
    });

    it("resolves media asset and storage paths to absolute URLs", () => {
      const url = resolveAbsoluteMediaUrl(sampleMedia);
      expect(url).toContain("https://test.supabase.co/storage/v1/object/public/portfolio-public/");

      const relativeUrl = resolveAbsoluteMediaUrl("/fixtures/hero.jpg");
      expect(relativeUrl).toBe("https://gabrielleaurelia.com/fixtures/hero.jpg");
    });
  });

  describe("Metadata generation", () => {
    it("extracts site SEO defaults from site settings", async () => {
      const defaults = await getSiteSeoDefaults();
      expect(defaults.siteName).toBe("Gabrielle Aurelia");
      expect(defaults.defaultSeoTitle).toBe("Gabrielle Aurelia — Spatial Design");
      expect(defaults.defaultOgImageUrl).toContain("https://test.supabase.co");
    });

    it("generates root metadata matching site settings", async () => {
      const metadata = await generateRootMetadata();

      expect(metadata.title).toEqual({
        default: "Gabrielle Aurelia — Spatial Design",
        template: "%s | Gabrielle Aurelia",
      });
      expect(metadata.description).toBe("Editorial interior architecture practice in Jakarta.");
      expect(metadata.openGraph?.images).toBeDefined();
    });

    it("generates page metadata with page-specific overrides", async () => {
      mocks.getPublishedPageWithSections.mockResolvedValue({
        page: {
          id: "p-about",
          slug: "about",
          title: "About Studio",
          navLabel: "About",
          seoTitle: "About Studio — Gabrielle Aurelia",
          seoDescription: "Studio philosophy and architectural design approach.",
          ogMediaId: null,
          status: "published",
        },
        sections: [],
      });

      const metadata = await generatePageMetadata("about");

      expect(metadata.title).toBe("About Studio — Gabrielle Aurelia");
      expect(metadata.description).toBe("Studio philosophy and architectural design approach.");
      expect(metadata.alternates?.canonical).toBe("https://gabrielleaurelia.com/about");
    });

    it("generates project case study metadata with project-specific SEO and OG", async () => {
      mocks.getPublishedProjectBySlug.mockResolvedValue(sampleProject);

      const metadata = await generateProjectMetadata("menteng-sanctuary");

      expect(metadata.title).toBe("Menteng Sanctuary | Case Study");
      expect(metadata.description).toBe(
        "Editorial case study exploring spatial tranquility in Menteng.",
      );
      expect(metadata.alternates?.canonical).toBe(
        "https://gabrielleaurelia.com/projects/menteng-sanctuary",
      );
    });
  });

  describe("Structured Data (JSON-LD)", () => {
    it("builds honest, factual Person and WebSite schemas", () => {
      const person = buildPersonOrOrganizationSchema(sampleSiteSettings);
      expect(person["@type"]).toBe("Person");
      expect(person.name).toBe("Gabrielle Aurelia");
      expect(person.jobTitle).toBe("Interior Designer");
      expect(person.email).toBe("contact@gabrielleaurelia.com");
      expect(person.sameAs).toContain("https://instagram.com/gabrielleaurelia");

      const website = buildWebSiteSchema(sampleSiteSettings);
      expect(website["@type"]).toBe("WebSite");
      expect(website.url).toBe("https://gabrielleaurelia.com");
    });

    it("builds BreadcrumbList schema with absolute URLs", () => {
      const breadcrumbs = buildBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Projects", path: "/projects" },
        { name: "Menteng Sanctuary", path: "/projects/menteng-sanctuary" },
      ]);

      expect(breadcrumbs["@type"]).toBe("BreadcrumbList");
      expect(breadcrumbs.itemListElement).toHaveLength(3);
      expect(breadcrumbs.itemListElement[2]?.item).toBe(
        "https://gabrielleaurelia.com/projects/menteng-sanctuary",
      );
    });

    it("builds CreativeWork schema for project case study", () => {
      const projectSchema = buildProjectSchema(sampleProject, sampleSiteSettings);

      expect(projectSchema["@type"]).toBe("CreativeWork");
      expect(projectSchema.name).toBe("Menteng Sanctuary");
      expect(projectSchema.dateCreated).toBe("2025");
      expect(projectSchema.genre).toBe("Private Residence");
    });
  });

  describe("Robots and Sitemap routes", () => {
    it("generates robots configuration disallowing admin and preview routes", () => {
      const result = robots();

      expect(result.rules).toEqual(
        expect.objectContaining({
          userAgent: "*",
          allow: "/",
          disallow: ["/admin", "/admin/", "/auth", "/auth/", "/admin/preview/"],
        }),
      );
      expect(result.sitemap).toBe("https://gabrielleaurelia.com/sitemap.xml");
    });

    it("generates sitemap with static public routes and published projects", async () => {
      const items = await sitemap();

      const urls = items.map((item) => item.url);
      expect(urls).toContain("https://gabrielleaurelia.com/");
      expect(urls).toContain("https://gabrielleaurelia.com/projects");
      expect(urls).toContain("https://gabrielleaurelia.com/projects/menteng-sanctuary");
      expect(urls).toContain("https://gabrielleaurelia.com/services");
      expect(urls).toContain("https://gabrielleaurelia.com/process");
      expect(urls).toContain("https://gabrielleaurelia.com/explorations");
      expect(urls).toContain("https://gabrielleaurelia.com/about");
      expect(urls).toContain("https://gabrielleaurelia.com/contact");

      // Verify admin / auth / preview routes are excluded
      expect(urls.some((url) => url.includes("/admin"))).toBe(false);
      expect(urls.some((url) => url.includes("/auth"))).toBe(false);
    });

    it("excludes unpublished pages from sitemap", async () => {
      mocks.getPublishedPages.mockResolvedValue([
        { id: "p-home", slug: "home", title: "Home", status: "published" },
        { id: "p-projects", slug: "projects", title: "Projects", status: "published" },
      ]);
      mocks.getPublishedProjects.mockResolvedValue([]);

      const items = await sitemap();
      const urls = items.map((item) => item.url);

      expect(urls).toContain("https://gabrielleaurelia.com/");
      expect(urls).toContain("https://gabrielleaurelia.com/projects");
      expect(urls).not.toContain("https://gabrielleaurelia.com/about");
    });
  });
});
