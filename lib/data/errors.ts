import * as z from "zod";

import { ContentValidationError } from "@/lib/validation/errors";

export type RepositoryErrorCode = "database" | "not_found";

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;

  constructor(code: RepositoryErrorCode, resource: string, cause?: unknown) {
    super(
      code === "not_found" ? `${resource} was not found.` : `Could not read ${resource}.`,
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
