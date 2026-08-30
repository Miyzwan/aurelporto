import * as z from "zod";

import { PAGE_SECTION_TYPES } from "@/types/content";

import {
  contentStatusSchema,
  jsonObjectSchema,
  optionalText,
  requiredText,
  uuidSchema,
} from "./common";

export const pageFormSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: requiredText(160),
    nav_label: optionalText(160),
    seo_title: optionalText(160),
    seo_description: optionalText(320),
    og_media_id: uuidSchema.nullable(),
    status: contentStatusSchema,
  })
  .strict();

export const pageRowSchema = pageFormSchema
  .extend({ id: uuidSchema, created_at: z.string(), updated_at: z.string() })
  .strict();

export const pageSectionFormSchema = z
  .object({
    page_id: uuidSchema,
    section_key: z.string().trim().min(1).max(120),
    section_type: z.enum(PAGE_SECTION_TYPES),
    content: z.unknown(),
    settings: jsonObjectSchema,
    sort_order: z.number().int(),
    is_enabled: z.boolean(),
    status: contentStatusSchema,
  })
  .strict();

export const pageSectionRowSchema = pageSectionFormSchema
  .extend({ id: uuidSchema, created_at: z.string(), updated_at: z.string() })
  .strict();
