import * as z from "zod";

import { contentStatusSchema, optionalText, requiredText, uuidSchema } from "./common";

export const explorationFormSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    title: requiredText(200),
    category: requiredText(120),
    description: optionalText(2000),
    year: z.number().int().min(1900).max(3000).nullable(),
    cover_media_id: uuidSchema.nullable(),
    sort_order: z.number().int(),
    status: contentStatusSchema,
  })
  .strict();

export const explorationRowSchema = explorationFormSchema
  .extend({ id: uuidSchema, created_at: z.string(), updated_at: z.string() })
  .strict();

export const explorationMediaFormSchema = z
  .object({
    exploration_id: uuidSchema,
    media_id: uuidSchema,
    caption: optionalText(1000),
    sort_order: z.number().int(),
  })
  .strict();

export const explorationMediaRowSchema = explorationMediaFormSchema
  .extend({ id: uuidSchema, created_at: z.string() })
  .strict();
