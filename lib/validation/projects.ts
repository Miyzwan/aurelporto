import * as z from "zod";

import { PROJECT_SECTION_TYPES } from "@/types/project-sections";

import {
  contentStatusSchema,
  nonNegativeNumberSchema,
  optionalText,
  projectStatusSchema,
  requiredText,
  uuidSchema,
} from "./common";

export const projectFormSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: requiredText(200),
    year: z.number().int().min(1900).max(3000),
    location: requiredText(160),
    project_type: requiredText(120),
    area_sqm: nonNegativeNumberSchema.nullable(),
    project_status: projectStatusSchema,
    client_type: optionalText(160),
    design_role: z.array(requiredText(120)).max(30),
    services: z.array(requiredText(120)).max(30),
    summary: requiredText(5000),
    hero_media_id: uuidSchema.nullable(),
    featured: z.boolean(),
    featured_order: z.number().int(),
    sort_order: z.number().int(),
    seo_title: optionalText(200),
    seo_description: optionalText(320),
    og_media_id: uuidSchema.nullable(),
    status: contentStatusSchema,
  })
  .strict();

export const projectRowSchema = projectFormSchema
  .extend({ id: uuidSchema, created_at: z.string(), updated_at: z.string() })
  .strict();

export const projectSectionFormSchema = z
  .object({
    project_id: uuidSchema,
    section_key: z.string().trim().min(1).max(120),
    section_type: z.enum(PROJECT_SECTION_TYPES),
    title: optionalText(160),
    content: z.unknown(),
    sort_order: z.number().int(),
    is_enabled: z.boolean(),
  })
  .strict();

export const projectSectionRowSchema = projectSectionFormSchema
  .extend({ id: uuidSchema, created_at: z.string(), updated_at: z.string() })
  .strict();
