import * as z from "zod";

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
