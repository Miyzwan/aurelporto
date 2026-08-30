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

export const publicInquiryInputSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(160, "Name cannot exceed 160 characters"),
    email: z
      .string()
      .trim()
      .email("Please provide a valid email address")
      .max(255, "Email cannot exceed 255 characters"),
    phone: z.string().trim().max(80, "Phone cannot exceed 80 characters").optional().nullable(),
    projectType: z
      .string()
      .trim()
      .min(1, "Project type is required")
      .max(120, "Project type cannot exceed 120 characters"),
    projectLocation: z
      .string()
      .trim()
      .min(1, "Project location is required")
      .max(240, "Location cannot exceed 240 characters"),
    areaSqm: z
      .union([z.number().min(0, "Area must be a positive number"), z.string().trim(), z.null()])
      .optional(),
    requiredService: z
      .string()
      .trim()
      .min(1, "Required service is required")
      .max(160, "Service cannot exceed 160 characters"),
    projectStatus: z
      .string()
      .trim()
      .min(1, "Project status is required")
      .max(120, "Project status cannot exceed 120 characters"),
    desiredTimeline: z
      .string()
      .trim()
      .min(1, "Desired timeline is required")
      .max(120, "Timeline cannot exceed 120 characters"),
    budgetRange: z
      .string()
      .trim()
      .max(120, "Budget range cannot exceed 120 characters")
      .optional()
      .nullable(),
    projectBrief: z
      .string()
      .trim()
      .min(1, "Project brief is required")
      .max(10000, "Project brief cannot exceed 10000 characters"),
    referralSource: z
      .string()
      .trim()
      .max(240, "Referral source cannot exceed 240 characters")
      .optional()
      .nullable(),
    company: z.string().optional().nullable(),
  })
  .strict();

export type PublicInquiryInput = z.infer<typeof publicInquiryInputSchema>;

export const inquiryAdminUpdateSchema = z
  .object({
    id: uuidSchema.optional(),
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
