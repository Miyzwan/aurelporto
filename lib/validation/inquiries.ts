import * as z from "zod";

import {
  inquiryStatusSchema,
  nonNegativeNumberSchema,
  optionalText,
  requiredText,
  uuidSchema,
} from "./common";

export const inquiryFormSchema = z
  .object({
    name: requiredText(160),
    email: z.email(),
    phone: optionalText(80),
    project_type: requiredText(120),
    project_location: requiredText(240),
    area_sqm: nonNegativeNumberSchema.nullable(),
    required_service: requiredText(160),
    project_status: requiredText(120),
    desired_timeline: requiredText(120),
    budget_range: optionalText(120),
    project_brief: requiredText(10000),
    referral_source: optionalText(240),
  })
  .strict();

export const inquiryAdminUpdateSchema = z
  .object({
    status: inquiryStatusSchema,
    admin_notes: optionalText(10000),
  })
  .strict();

export const inquiryRowSchema = inquiryFormSchema
  .extend({
    id: uuidSchema,
    status: inquiryStatusSchema,
    admin_notes: optionalText(10000),
    submitted_at: z.string(),
    updated_at: z.string(),
  })
  .strict();
