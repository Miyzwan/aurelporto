import * as z from "zod";

import {
  ALLOWED_MEDIA_MIME_TYPES,
  MAX_MEDIA_FILE_SIZE_BYTES,
  PORTFOLIO_PUBLIC_BUCKET,
} from "@/lib/media/upload";

import { nonNegativeIntegerSchema, optionalText, requiredText, uuidSchema } from "./common";

export const mediaAssetFormSchema = z
  .object({
    bucket: z.literal("portfolio-public"),
    storage_path: requiredText(1024),
    media_type: z.enum(["image", "video"]),
    alt_text: requiredText(240),
    caption: optionalText(1000),
    photographer: optionalText(160),
    width: nonNegativeIntegerSchema.nullable(),
    height: nonNegativeIntegerSchema.nullable(),
    poster_path: z.string().trim().max(1024).nullable(),
    mime_type: requiredText(160),
    file_size_bytes: nonNegativeIntegerSchema.nullable(),
    is_archived: z.boolean(),
    created_by: uuidSchema.nullable(),
  })
  .strict();

export const mediaAssetRowSchema = mediaAssetFormSchema
  .extend({ id: uuidSchema, created_at: z.string(), updated_at: z.string() })
  .strict();

const storagePathSchema = z
  .string()
  .trim()
  .max(1024)
  .regex(
    /^portfolio\/\d{4}\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-z0-9][a-z0-9._-]*$/,
    "Storage path must use the portfolio/YYYY/uuid-filename format.",
  );

export const mediaUploadInputSchema = z
  .object({
    bucket: z.literal(PORTFOLIO_PUBLIC_BUCKET),
    storage_path: storagePathSchema,
    media_type: z.enum(["image", "video"]),
    alt_text: requiredText(240),
    caption: optionalText(1000),
    photographer: optionalText(160),
    width: nonNegativeIntegerSchema.nullable(),
    height: nonNegativeIntegerSchema.nullable(),
    poster_path: z.string().trim().max(1024).nullable(),
    mime_type: z.enum(ALLOWED_MEDIA_MIME_TYPES),
    file_size_bytes: nonNegativeIntegerSchema.max(MAX_MEDIA_FILE_SIZE_BYTES),
  })
  .strict()
  .superRefine((value, context) => {
    const expectedType = value.mime_type.startsWith("video/") ? "video" : "image";
    if (value.media_type !== expectedType) {
      context.addIssue({
        code: "custom",
        path: ["media_type"],
        message: "Media type must match the uploaded MIME type.",
      });
    }
  });
