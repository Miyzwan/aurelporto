import * as z from "zod";

import { contentStatusSchema, optionalText, requiredText, uuidSchema } from "./common";

export const testimonialFormSchema = z
  .object({
    client_name: requiredText(160),
    client_role: optionalText(160),
    project_name: optionalText(200),
    quote: requiredText(3000),
    sort_order: z.number().int(),
    featured: z.boolean(),
    status: contentStatusSchema,
  })
  .strict();

export const testimonialRowSchema = testimonialFormSchema
  .extend({ id: uuidSchema, created_at: z.string(), updated_at: z.string() })
  .strict();
