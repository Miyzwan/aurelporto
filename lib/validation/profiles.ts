import * as z from "zod";

import { optionalText, uuidSchema } from "./common";

export const profileFormSchema = z
  .object({
    role: z.literal("admin"),
    display_name: optionalText(160),
  })
  .strict();

export const profileRowSchema = profileFormSchema
  .extend({ id: uuidSchema, created_at: z.string(), updated_at: z.string() })
  .strict();
