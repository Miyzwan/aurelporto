import { getPublicMediaAssetsByIds } from "@/lib/data/media";
import { getPublishedPageWithSections } from "@/lib/data/pages";
import { getPublishedTestimonials } from "@/lib/data/testimonials";
import type {
  CredibilityContent,
  GalleryContent,
  HomeHeroContent,
  MaterialMomentContent,
  MediaAsset,
  Page,
  PageSection,
  Testimonial,
} from "@/types/content";

export interface ResolvedPublicPageSection {
  section: PageSection;
  media: MediaAsset[];
  testimonials?: Testimonial[];
}

export interface PublicPageData {
  page: Page;
  sections: ResolvedPublicPageSection[];
}

function contentOf<T>(section: PageSection): T {
  return section.content as T;
}

function mediaIdsFor(section: PageSection): string[] {
  switch (section.sectionType) {
    case "home_hero": {
      const content = contentOf<HomeHeroContent>(section);
      return content.heroMediaId ? [content.heroMediaId] : [];
    }
    case "material_moment":
      return contentOf<MaterialMomentContent>(section).mediaIds;
    case "gallery":
      return contentOf<GalleryContent>(section).mediaIds;
    default:
      return [];
  }
}

function testimonialIdsFor(section: PageSection): string[] {
  if (section.sectionType === "credibility") {
    return contentOf<CredibilityContent>(section).testimonialIds;
  }
  return [];
}

function resolveMedia(ids: string[], assets: MediaAsset[]): MediaAsset[] {
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  return ids.map((id) => assetsById.get(id)).filter((asset): asset is MediaAsset => Boolean(asset));
}

function byId<T extends { id: string }>(ids: string[], records: T[]): T[] {
  const recordsById = new Map(records.map((record) => [record.id, record]));
  return ids.map((id) => recordsById.get(id)).filter((record): record is T => Boolean(record));
}

const KNOWN_PUBLIC_PAGES: Record<string, string> = {
  about: "About",
  contact: "Contact",
  process: "Process",
  services: "Services",
  explorations: "Explorations",
};

export async function getPublicPageData(slug: string): Promise<PublicPageData | null> {
  try {
    const result = await getPublishedPageWithSections(slug);
    if (!result) {
      const title = KNOWN_PUBLIC_PAGES[slug];
      if (title) {
        return {
          page: {
            id: `fallback-${slug}`,
            slug,
            title,
            navLabel: title,
            seoTitle: null,
            seoDescription: null,
            ogMediaId: null,
            status: "published",
          },
          sections: [],
        };
      }
      return null;
    }

    const mediaIds = [...new Set(result.sections.flatMap(mediaIdsFor))].filter(Boolean);
    const testimonialIds = [...new Set(result.sections.flatMap(testimonialIdsFor))].filter(Boolean);

    const [media, testimonials] = await Promise.all([
      mediaIds.length > 0 ? getPublicMediaAssetsByIds(mediaIds).catch(() => []) : [],
      testimonialIds.length > 0 ? getPublishedTestimonials().catch(() => []) : [],
    ]);

    return {
      page: result.page,
      sections: result.sections.map((section) => {
        const item: ResolvedPublicPageSection = {
          section,
          media: resolveMedia(mediaIdsFor(section), media),
        };
        if (section.sectionType === "credibility") {
          item.testimonials = byId(testimonialIdsFor(section), testimonials);
        }
        return item;
      }),
    };
  } catch (error) {
    console.error(`[public-pages] could not fetch page data for ${slug}:`, error);
    const title = KNOWN_PUBLIC_PAGES[slug];
    if (title) {
      return {
        page: {
          id: `fallback-${slug}`,
          slug,
          title,
          navLabel: title,
          seoTitle: null,
          seoDescription: null,
          ogMediaId: null,
          status: "published",
        },
        sections: [],
      };
    }
    return null;
  }
}
