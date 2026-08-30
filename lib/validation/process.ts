import * as z from "zod";

import { contentStatusSchema, requiredText, uuidSchema } from "./common";

export const processStepFormSchema = z
  .object({
    step_no: z.number().int().positive(),
    title: requiredText(160),
    description: requiredText(2000),
    media_id: uuidSchema.nullable(),
    sort_order: z.number().int(),
    status: contentStatusSchema,
  })
  .strict();

export const processStepRowSchema = processStepFormSchema
  .extend({ id: uuidSchema, created_at: z.string(), updated_at: z.string() })
  .strict();
