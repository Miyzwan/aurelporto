import * as z from "zod";

import { internalOrExternalHrefSchema, jsonObjectSchema, requiredText, uuidSchema } from "./common";

export const socialLinkSchema = z
  .object({
    label: requiredText(80),
    href: internalOrExternalHrefSchema,
  })
  .strict();

export const socialLinksSchema = z.array(socialLinkSchema).max(20);

export const inquiryConfigSchema = z
  .object({
    projectTypes: z.array(requiredText(80)).max(50),
    projectStatuses: z.array(requiredText(80)).max(50),
    timelineOptions: z.array(requiredText(80)).max(50),
    budgetOptions: z.array(requiredText(80)).max(50),
    showBudgetField: z.boolean(),
    showPhoneField: z.boolean(),
    successTitle: requiredText(160),
    successBody: requiredText(1000),
  })
  .strict();

export const siteSettingsFormSchema = z
  .object({
    site_name: requiredText(160),
    professional_role: requiredText(160),
    location: z.string().trim().max(160).nullable(),
    service_area: z.string().trim().max(240).nullable(),
    email: z.email().nullable(),
    phone: z.string().trim().max(80).nullable(),
    whatsapp: z.string().trim().max(80).nullable(),
    social_links: socialLinksSchema,
    footer_text: z.string().trim().max(500).nullable(),
    default_seo_title: requiredText(160),
    default_seo_description: requiredText(320),
    default_og_media_id: uuidSchema.nullable(),
    inquiry_config: inquiryConfigSchema,
  })
  .strict();

export const siteSettingsRowSchema = siteSettingsFormSchema
  .extend({ id: z.literal(1), created_at: z.string(), updated_at: z.string() })
  .strict();

export const navigationItemFormSchema = z
  .object({
    label: requiredText(160),
    href: internalOrExternalHrefSchema,
    placement: z.enum(["header", "footer", "social"]),
    sort_order: z.number().int(),
    is_visible: z.boolean(),
    target_blank: z.boolean(),
  })
  .strict();

export const navigationItemRowSchema = navigationItemFormSchema
  .extend({ id: uuidSchema, created_at: z.string(), updated_at: z.string() })
  .strict();

export const settingsSchema = jsonObjectSchema;
