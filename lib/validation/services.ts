import * as z from "zod";

import { contentStatusSchema, optionalText, requiredText, uuidSchema } from "./common";

const textList = z.array(requiredText(240)).max(100);

export const serviceFormSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: requiredText(160),
    short_description: requiredText(1000),
    full_description: optionalText(5000),
    ideal_client: optionalText(1000),
    scope: textList,
    deliverables: textList,
    included: textList,
    excluded: textList,
    typical_project_types: textList,
    media_id: uuidSchema.nullable(),
    sort_order: z.number().int(),
    featured: z.boolean(),
    status: contentStatusSchema,
  })
  .strict();

export const serviceRowSchema = serviceFormSchema
  .extend({ id: uuidSchema, created_at: z.string(), updated_at: z.string() })
  .strict();
