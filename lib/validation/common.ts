import * as z from "zod";

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);
export const projectStatusSchema = z.enum(["concept", "ongoing", "completed"]);
export const inquiryStatusSchema = z.enum(["new", "contacted", "qualified", "won", "lost", "spam"]);

// PostgreSQL accepts UUIDs with deterministic/version-less bits too (the
// staging seed uses them), so use GUID syntax rather than enforcing RFC
// version/variant bits on persisted identifiers.
export const uuidSchema = z.guid();
export const nullableUuidSchema = uuidSchema.nullable();

export function requiredText(maximum = 5000) {
  return z.string().trim().min(1).max(maximum);
}

export function optionalText(maximum = 5000) {
  return z.string().trim().max(maximum).nullable();
}

export const nonNegativeIntegerSchema = z.number().int().nonnegative();
export const nonNegativeNumberSchema = z.number().finite().nonnegative();

export const internalOrExternalHrefSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine((value) => value.startsWith("/") || /^https?:\/\//i.test(value), {
    message: "Use an internal path or an http(s) URL.",
  });

export const jsonObjectSchema = z.record(z.string(), z.unknown());
