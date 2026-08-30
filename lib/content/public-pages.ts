import { getPublicMediaAssetsByIds } from "@/lib/data/media";
import { getPublishedPageWithSections } from "@/lib/data/pages";
import type {
  GalleryContent,
  HomeHeroContent,
  MaterialMomentContent,
  MediaAsset,
  Page,
  PageSection,
} from "@/types/content";

export interface ResolvedPublicPageSection {
  section: PageSection;
  media: MediaAsset[];
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

function resolveMedia(ids: string[], assets: MediaAsset[]): MediaAsset[] {
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));
  return ids.map((id) => assetsById.get(id)).filter((asset): asset is MediaAsset => Boolean(asset));
}

export async function getPublicPageData(slug: string): Promise<PublicPageData | null> {
  const result = await getPublishedPageWithSections(slug);
  if (!result) return null;

  const mediaIds = [...new Set(result.sections.flatMap(mediaIdsFor))].filter(Boolean);
  const media = mediaIds.length > 0 ? await getPublicMediaAssetsByIds(mediaIds) : [];

  return {
    page: result.page,
    sections: result.sections.map((section) => ({
      section,
      media: resolveMedia(mediaIdsFor(section), media),
    })),
  };
}
