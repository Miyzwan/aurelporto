export type FieldErrors = Record<string, string[]>;

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; formError?: string; fieldErrors?: FieldErrors };

export function getFieldErrors(
  fieldErrors: FieldErrors | undefined,
  fieldName: string | undefined,
): readonly string[] {
  if (!fieldName) return [];
  return fieldErrors?.[fieldName] ?? [];
}
