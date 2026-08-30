import * as z from "zod";

import type { ProjectSectionContent, ProjectSectionType } from "@/types/project-sections";
import { PLAN_ITEM_TYPES, PROJECT_SECTION_TYPES } from "@/types/project-sections";

import { emptyText } from "./shared";
import { ContentValidationError } from "./errors";
import { uuidSchema } from "./common";

const mediaIdsSchema = z.array(uuidSchema).max(100);

export const narrativeSchema = z.object({ body: emptyText, mediaIds: mediaIdsSchema }).strict();

const planItemSchema = z
  .object({
    title: emptyText,
    type: z.enum(PLAN_ITEM_TYPES),
    mediaId: uuidSchema,
    caption: emptyText,
  })
  .strict();

export const planSequenceSchema = z
  .object({ intro: emptyText, items: z.array(planItemSchema).max(100) })
  .strict();

const materialItemSchema = z
  .object({
    name: emptyText,
    application: emptyText,
    description: emptyText,
    mediaId: uuidSchema,
  })
  .strict();

export const materialPaletteSchema = z
  .object({ intro: emptyText, items: z.array(materialItemSchema).max(100) })
  .strict();

const beforeAfterPairSchema = z
  .object({ label: emptyText, beforeMediaId: uuidSchema, afterMediaId: uuidSchema })
  .strict();

export const beforeAfterSchema = z
  .object({ intro: emptyText, pairs: z.array(beforeAfterPairSchema).max(100) })
  .strict();

export const projectGallerySchema = z
  .object({ intro: emptyText, mediaIds: mediaIdsSchema })
  .strict();

const creditItemSchema = z.object({ role: emptyText, name: emptyText, url: emptyText }).strict();

export const creditsSchema = z.object({ items: z.array(creditItemSchema).max(100) }).strict();

const narrativeEntries = (type: string) =>
  z.object({ sectionType: z.literal(type), content: narrativeSchema });

export const projectSectionContentSchemas = {
  overview: narrativeSchema,
  brief: narrativeSchema,
  existing_condition: narrativeSchema,
  challenge: narrativeSchema,
  concept: narrativeSchema,
  plan_sequence: planSequenceSchema,
  material_palette: materialPaletteSchema,
  lighting_strategy: narrativeSchema,
  custom_furniture: narrativeSchema,
  visualization: narrativeSchema,
  implementation: narrativeSchema,
  before_after: beforeAfterSchema,
  gallery: projectGallerySchema,
  outcome: narrativeSchema,
  credits: creditsSchema,
  rich_text: narrativeSchema,
} as const satisfies Record<ProjectSectionType, z.ZodType>;

export const projectSectionContentSchema = z.discriminatedUnion("sectionType", [
  narrativeEntries("overview"),
  narrativeEntries("brief"),
  narrativeEntries("existing_condition"),
  narrativeEntries("challenge"),
  narrativeEntries("concept"),
  z.object({ sectionType: z.literal("plan_sequence"), content: planSequenceSchema }),
  z.object({ sectionType: z.literal("material_palette"), content: materialPaletteSchema }),
  narrativeEntries("lighting_strategy"),
  narrativeEntries("custom_furniture"),
  narrativeEntries("visualization"),
  narrativeEntries("implementation"),
  z.object({ sectionType: z.literal("before_after"), content: beforeAfterSchema }),
  z.object({ sectionType: z.literal("gallery"), content: projectGallerySchema }),
  narrativeEntries("outcome"),
  z.object({ sectionType: z.literal("credits"), content: creditsSchema }),
  narrativeEntries("rich_text"),
]);

export const projectSectionSchema = projectSectionContentSchema;

export function parseProjectSectionContent(
  sectionType: string,
  content: unknown,
  recordId: string,
): ProjectSectionContent {
  const result = projectSectionContentSchema.safeParse({ sectionType, content });

  if (!result.success) {
    throw new ContentValidationError(recordId, "project_sections.content", result.error.issues);
  }

  return result.data.content as ProjectSectionContent;
}

export { PROJECT_SECTION_TYPES };
