import * as z from "zod";

import type { PageSectionContent, PageSectionType } from "@/types/content";

import {
  internalOrExternalHrefSchema,
  nonNegativeIntegerSchema,
  requiredText,
  uuidSchema,
} from "./common";
import { ContentValidationError } from "./errors";

const mediaIdsSchema = z.array(uuidSchema).max(100);
const emptyText = z.string().trim().max(5000);

export const homeHeroSchema = z
  .object({
    eyebrow: emptyText,
    headline: requiredText(240),
    subheadline: emptyText,
    location: emptyText,
    heroMediaId: uuidSchema.nullable(),
    signatureProjectId: uuidSchema.nullable(),
    primaryCtaLabel: requiredText(120),
    primaryCtaHref: internalOrExternalHrefSchema,
    secondaryCtaLabel: requiredText(120),
    secondaryCtaHref: internalOrExternalHrefSchema,
  })
  .strict();

export const positioningSchema = z
  .object({
    eyebrow: emptyText,
    lines: z.array(requiredText(240)).max(12),
    body: emptyText,
  })
  .strict();

export const featuredProjectsSchema = z
  .object({
    title: requiredText(160),
    intro: emptyText,
    maxItems: nonNegativeIntegerSchema.min(1).max(50),
  })
  .strict();

const philosophyItemSchema = z.object({ title: requiredText(160), body: emptyText }).strict();

export const philosophySchema = z
  .object({
    title: requiredText(160),
    intro: emptyText,
    items: z.array(philosophyItemSchema).max(12),
  })
  .strict();

export const servicesPreviewSchema = z
  .object({
    title: requiredText(160),
    intro: emptyText,
    maxItems: nonNegativeIntegerSchema.min(1).max(50),
  })
  .strict();

export const processPreviewSchema = z
  .object({
    title: requiredText(160),
    intro: emptyText,
    maxItems: nonNegativeIntegerSchema.min(1).max(50),
  })
  .strict();

export const materialMomentSchema = z
  .object({ title: requiredText(160), intro: emptyText, mediaIds: mediaIdsSchema })
  .strict();

const credibilityStatSchema = z
  .object({ value: requiredText(120), label: requiredText(160) })
  .strict();

export const credibilitySchema = z
  .object({
    title: requiredText(160),
    stats: z.array(credibilityStatSchema).max(30),
    testimonialIds: z.array(uuidSchema).max(50),
  })
  .strict();

export const ctaSchema = z
  .object({
    eyebrow: emptyText,
    title: requiredText(240),
    body: emptyText,
    ctaLabel: requiredText(120),
    ctaHref: internalOrExternalHrefSchema,
  })
  .strict();

export const richTextSchema = z.object({ title: emptyText, body: emptyText }).strict();

export const gallerySchema = z
  .object({ title: emptyText, intro: emptyText, mediaIds: mediaIdsSchema })
  .strict();

export const pageSectionContentSchemas = {
  home_hero: homeHeroSchema,
  positioning: positioningSchema,
  featured_projects: featuredProjectsSchema,
  philosophy: philosophySchema,
  services_preview: servicesPreviewSchema,
  process_preview: processPreviewSchema,
  material_moment: materialMomentSchema,
  credibility: credibilitySchema,
  cta: ctaSchema,
  rich_text: richTextSchema,
  gallery: gallerySchema,
} as const satisfies Record<PageSectionType, z.ZodType>;

export const pageSectionContentSchema = z.discriminatedUnion("sectionType", [
  z.object({ sectionType: z.literal("home_hero"), content: homeHeroSchema }),
  z.object({ sectionType: z.literal("positioning"), content: positioningSchema }),
  z.object({ sectionType: z.literal("featured_projects"), content: featuredProjectsSchema }),
  z.object({ sectionType: z.literal("philosophy"), content: philosophySchema }),
  z.object({ sectionType: z.literal("services_preview"), content: servicesPreviewSchema }),
  z.object({ sectionType: z.literal("process_preview"), content: processPreviewSchema }),
  z.object({ sectionType: z.literal("material_moment"), content: materialMomentSchema }),
  z.object({ sectionType: z.literal("credibility"), content: credibilitySchema }),
  z.object({ sectionType: z.literal("cta"), content: ctaSchema }),
  z.object({ sectionType: z.literal("rich_text"), content: richTextSchema }),
  z.object({ sectionType: z.literal("gallery"), content: gallerySchema }),
]);

export const pageSectionSchema = pageSectionContentSchema;

export type ParsedPageSectionContent = z.infer<typeof pageSectionContentSchema>;

export function parsePageSectionContent(
  sectionType: string,
  content: unknown,
  recordId: string,
): PageSectionContent {
  const result = pageSectionContentSchema.safeParse({ sectionType, content });

  if (!result.success) {
    throw new ContentValidationError(recordId, "page_sections.content", result.error.issues);
  }

  return result.data.content as PageSectionContent;
}
