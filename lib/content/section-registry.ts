import type { ZodType } from "zod";

import type { PageSectionContent, PageSectionType } from "@/types/content";

import {
  ctaSchema,
  credibilitySchema,
  featuredProjectsSchema,
  gallerySchema,
  homeHeroSchema,
  materialMomentSchema,
  pageSectionContentSchemas,
  philosophySchema,
  positioningSchema,
  processPreviewSchema,
  richTextSchema,
  servicesPreviewSchema,
} from "@/lib/validation/page-sections";

export interface SectionDefinition {
  sectionType: PageSectionType;
  schema: ZodType;
  editorKey: string;
  rendererKey: string;
}

export const SECTION_REGISTRY = {
  home_hero: {
    sectionType: "home_hero",
    schema: homeHeroSchema,
    editorKey: "home-hero",
    rendererKey: "home-hero",
  },
  positioning: {
    sectionType: "positioning",
    schema: positioningSchema,
    editorKey: "positioning",
    rendererKey: "positioning",
  },
  featured_projects: {
    sectionType: "featured_projects",
    schema: featuredProjectsSchema,
    editorKey: "featured-projects",
    rendererKey: "featured-projects",
  },
  philosophy: {
    sectionType: "philosophy",
    schema: philosophySchema,
    editorKey: "philosophy",
    rendererKey: "philosophy",
  },
  services_preview: {
    sectionType: "services_preview",
    schema: servicesPreviewSchema,
    editorKey: "services-preview",
    rendererKey: "services-preview",
  },
  process_preview: {
    sectionType: "process_preview",
    schema: processPreviewSchema,
    editorKey: "process-preview",
    rendererKey: "process-preview",
  },
  material_moment: {
    sectionType: "material_moment",
    schema: materialMomentSchema,
    editorKey: "material-moment",
    rendererKey: "material-moment",
  },
  credibility: {
    sectionType: "credibility",
    schema: credibilitySchema,
    editorKey: "credibility",
    rendererKey: "credibility",
  },
  cta: {
    sectionType: "cta",
    schema: ctaSchema,
    editorKey: "cta",
    rendererKey: "cta",
  },
  rich_text: {
    sectionType: "rich_text",
    schema: richTextSchema,
    editorKey: "rich-text",
    rendererKey: "rich-text",
  },
  gallery: {
    sectionType: "gallery",
    schema: gallerySchema,
    editorKey: "gallery",
    rendererKey: "gallery",
  },
} as const satisfies Record<PageSectionType, SectionDefinition>;

export const sectionRegistry = SECTION_REGISTRY;

export function isPageSectionType(value: string): value is PageSectionType {
  return Object.prototype.hasOwnProperty.call(SECTION_REGISTRY, value);
}

export function getSectionDefinition(sectionType: string): SectionDefinition | undefined {
  return isPageSectionType(sectionType) ? SECTION_REGISTRY[sectionType] : undefined;
}

export function parseRegisteredPageSectionContent(
  sectionType: string,
  content: unknown,
): PageSectionContent | undefined {
  const definition = getSectionDefinition(sectionType);
  if (!definition) return undefined;

  const result = definition.schema.safeParse(content);
  return result.success ? (result.data as PageSectionContent) : undefined;
}

export { pageSectionContentSchemas };
