import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MediaAsset, Page, PageSection } from "@/types/content";

const mocks = vi.hoisted(() => ({
  getPublicMediaAssetsByIds: vi.fn(),
  getPublishedPageWithSections: vi.fn(),
}));

vi.mock("@/lib/data/media", () => ({
  getPublicMediaAssetsByIds: mocks.getPublicMediaAssetsByIds,
}));
vi.mock("@/lib/data/pages", () => ({
  getPublishedPageWithSections: mocks.getPublishedPageWithSections,
}));

import { getPublicPageData } from "@/lib/content/public-pages";

const PAGE: Page = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "about",
  title: "About",
  navLabel: "About",
  seoTitle: null,
  seoDescription: null,
  ogMediaId: null,
  status: "published",
};

const MEDIA: MediaAsset = {
  id: "00000000-0000-0000-0000-000000000101",
  bucket: "portfolio-public",
  storagePath: "about/portrait.jpg",
  mediaType: "image",
  altText: "Portrait",
  caption: null,
  photographer: null,
  width: 1200,
  height: 1600,
  posterPath: null,
  mimeType: "image/jpeg",
};

function section(overrides: Partial<PageSection>): PageSection {
  return {
    id: "00000000-0000-0000-0000-000000000201",
    pageId: PAGE.id,
    sectionKey: "gallery",
    sectionType: "gallery",
    content: { title: "Gallery", intro: "", mediaIds: [MEDIA.id] },
    settings: {},
    sortOrder: 0,
    isEnabled: true,
    status: "published",
    ...overrides,
  };
}

describe("public page content adapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublicMediaAssetsByIds.mockResolvedValue([MEDIA]);
  });

  it("resolves section media while preserving the CMS reference order", async () => {
    const gallery = section({
      content: { title: "Gallery", intro: "", mediaIds: [MEDIA.id, "missing-media"] },
    });
    mocks.getPublishedPageWithSections.mockResolvedValue({ page: PAGE, sections: [gallery] });

    await expect(getPublicPageData("about")).resolves.toEqual({
      page: PAGE,
      sections: [{ section: gallery, media: [MEDIA] }],
    });
    expect(mocks.getPublicMediaAssetsByIds).toHaveBeenCalledWith([MEDIA.id, "missing-media"]);
  });

  it("does not read media for a page with no media-bearing sections", async () => {
    const richText = section({
      sectionKey: "intro",
      sectionType: "rich_text",
      content: { title: "Intro", body: "A short introduction." },
    });
    mocks.getPublishedPageWithSections.mockResolvedValue({ page: PAGE, sections: [richText] });

    await expect(getPublicPageData("about")).resolves.toEqual({
      page: PAGE,
      sections: [{ section: richText, media: [] }],
    });
    expect(mocks.getPublicMediaAssetsByIds).not.toHaveBeenCalled();
  });

  it("returns null for a page that is not published", async () => {
    mocks.getPublishedPageWithSections.mockResolvedValue(null);

    await expect(getPublicPageData("draft-page")).resolves.toBeNull();
    expect(mocks.getPublicMediaAssetsByIds).not.toHaveBeenCalled();
  });
});
