import * as z from "zod";

import { ContentValidationError } from "@/lib/validation/errors";

export type RepositoryErrorCode = "database" | "not_found";

/**
 * Supabase returns plain objects rather than Errors, so `cause` alone is not
 * printed by Node's error formatting. Without this detail a failure reads only
 * as "Could not read site settings", which is indistinguishable between a wrong
 * API key, a missing table, and a denied grant — the exact ambiguity that made a
 * broken production deployment take a full investigation to explain.
 */
function describeCause(cause: unknown): string {
  if (!cause || typeof cause !== "object") return "";

  const { message, code, hint } = cause as { message?: string; code?: string; hint?: string };
  const parts = [code && `[${code}]`, message, hint && `(hint: ${hint})`].filter(Boolean);

  return parts.length > 0 ? ` ${parts.join(" ")}` : "";
}

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;

  constructor(code: RepositoryErrorCode, resource: string, cause?: unknown) {
    super(
      code === "not_found"
        ? `${resource} was not found.`
        : `Could not read ${resource}.${describeCause(cause)}`,
      cause instanceof Error ? { cause } : undefined,
    );
    this.name = "RepositoryError";
    this.code = code;
  }
}

export function throwDatabaseError(resource: string, error: unknown): never {
  throw new RepositoryError("database", resource, error);
}

export function throwNotFound(resource: string): never {
  throw new RepositoryError("not_found", resource);
}

export function parseRecord<T>(
  schema: z.ZodType<T>,
  value: unknown,
  recordId: string,
  resource: string,
): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ContentValidationError(recordId, resource, result.error.issues);
  }

  return result.data;
}

export { ContentValidationError };
