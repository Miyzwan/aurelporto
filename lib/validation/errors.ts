import * as z from "zod";

export class ContentValidationError extends Error {
  readonly code = "content_validation" as const;

  constructor(
    readonly recordId: string,
    readonly resource: string,
    readonly issues: z.ZodError["issues"],
  ) {
    super(`Invalid ${resource} for content record ${recordId}.`);
    this.name = "ContentValidationError";
  }
}
