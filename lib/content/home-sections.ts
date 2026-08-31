import { getFeaturedProjects, getPublishedProjectById } from "@/lib/data/projects";
import { getPublishedPageSections } from "@/lib/data/pages";
import { getPublicMediaAssetsByIds } from "@/lib/data/media";
import { getPublishedProcessSteps } from "@/lib/data/process";
import { getPublishedServices } from "@/lib/data/services";
import { getPublishedTestimonials } from "@/lib/data/testimonials";
import type {
  CredibilityContent,
  GalleryContent,
  HomeHeroContent,
  MaterialMomentContent,
  MediaAsset,
  PageSection,
  PageSectionType,
  ProcessStep,
  ProjectSummary,
  ServiceSummary,
  Testimonial,
} from "@/types/content";

export interface ResolvedHomeSection {
  section: PageSection;
  heroMedia: MediaAsset | null;
  signatureProject: ProjectSummary | null;
  featuredProjects: ProjectSummary[];
  services: ServiceSummary[];
  processSteps: ProcessStep[];
  media: MediaAsset[];
  testimonials: Testimonial[];
}

function contentOf<T>(section: PageSection): T {
  return section.content as T;
}

function unique(values: string[]): string[] {
  return [...new Set(values)].filter(Boolean);
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

function signatureProjectIdsFor(sections: PageSection[]): string[] {
  return sections
    .filter((section) => section.sectionType === "home_hero")
    .map((section) => contentOf<HomeHeroContent>(section).signatureProjectId)
    .filter((id): id is string => Boolean(id));
}

function testimonialIdsFor(sections: PageSection[]): string[] {
  return sections
    .filter((section) => section.sectionType === "credibility")
    .flatMap((section) => contentOf<CredibilityContent>(section).testimonialIds);
}

function maxFeaturedItemsFor(sections: PageSection[]): number {
  return sections
    .filter((section) => section.sectionType === "featured_projects")
    .reduce((maxItems, section) => {
      const maxItemsForSection = contentOf<{ maxItems: number }>(section).maxItems;
      return Math.max(maxItems, maxItemsForSection);
    }, 0);
}

function hasSection(sections: PageSection[], sectionType: PageSectionType): boolean {
  return sections.some((section) => section.sectionType === sectionType);
}

function sortFeaturedProjects(projects: ProjectSummary[]): ProjectSummary[] {
  return [...projects].sort(
    (a, b) =>
      a.featuredOrder - b.featuredOrder || a.sortOrder - b.sortOrder || a.id.localeCompare(b.id),
  );
}

function byId<T extends { id: string }>(ids: string[], records: T[]): T[] {
  const recordsById = new Map(records.map((record) => [record.id, record]));
  return ids.map((id) => recordsById.get(id)).filter((record): record is T => Boolean(record));
}

export async function getHomePageSections(): Promise<ResolvedHomeSection[]> {
  try {
    const sections = (await getPublishedPageSections("home"))
      .filter((section) => section.isEnabled && section.status === "published")
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id));
    if (sections.length === 0) return [];

    const mediaIds = unique(sections.flatMap(mediaIdsFor));
    const signatureProjectIds = unique(signatureProjectIdsFor(sections));
    const testimonialIds = unique(testimonialIdsFor(sections));
    const maxFeaturedItems = maxFeaturedItemsFor(sections);

    const [media, featuredProjects, services, processSteps, testimonials, signatureProjects] =
      await Promise.all([
        mediaIds.length > 0 ? getPublicMediaAssetsByIds(mediaIds) : Promise.resolve([]),
        maxFeaturedItems > 0 ? getFeaturedProjects(maxFeaturedItems) : Promise.resolve([]),
        hasSection(sections, "services_preview") ? getPublishedServices() : Promise.resolve([]),
        hasSection(sections, "process_preview") ? getPublishedProcessSteps() : Promise.resolve([]),
        testimonialIds.length > 0 ? getPublishedTestimonials() : Promise.resolve([]),
        Promise.all(signatureProjectIds.map((id) => getPublishedProjectById(id))),
      ]);

    const mediaById = new Map(media.map((asset) => [asset.id, asset]));
    const signatureProjectById = new Map(
      signatureProjects
        .filter((project): project is ProjectSummary => Boolean(project))
        .map((project) => [project.id, project]),
    );
    const testimonialsById = byId(testimonialIds, testimonials);
    const orderedFeaturedProjects = sortFeaturedProjects(
      featuredProjects.filter((project) => project.featured),
    );

    return sections.map((section) => {
      const heroContent =
        section.sectionType === "home_hero" ? contentOf<HomeHeroContent>(section) : null;
      const materialContent =
        section.sectionType === "material_moment"
          ? contentOf<MaterialMomentContent>(section)
          : null;
      const galleryContent =
        section.sectionType === "gallery" ? contentOf<GalleryContent>(section) : null;

      return {
        section,
        heroMedia: heroContent?.heroMediaId
          ? (mediaById.get(heroContent.heroMediaId) ?? null)
          : null,
        signatureProject: heroContent?.signatureProjectId
          ? (signatureProjectById.get(heroContent.signatureProjectId) ?? null)
          : null,
        featuredProjects: orderedFeaturedProjects,
        services: hasSection([section], "services_preview") ? services : [],
        processSteps: hasSection([section], "process_preview") ? processSteps : [],
        media: byId(materialContent?.mediaIds ?? galleryContent?.mediaIds ?? [], media),
        testimonials:
          section.sectionType === "credibility"
            ? byId(contentOf<CredibilityContent>(section).testimonialIds, testimonialsById)
            : [],
      };
    });
  } catch (error) {
    console.error("[home-sections] failed to fetch home sections:", error);
    return [];
  }
}

/** Alias kept descriptive for callers that need the adapter's purpose. */
export const getHomePageData = getHomePageSections;
