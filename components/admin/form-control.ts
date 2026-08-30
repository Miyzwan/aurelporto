import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

import { getFieldErrors, type FieldErrors } from "./action-result";

export interface FieldErrorProps {
  errors?: readonly string[];
  fieldErrors?: FieldErrors;
}

export function resolveFieldErrors(
  errors: readonly string[] | undefined,
  fieldErrors: FieldErrors | undefined,
  fieldName: string | undefined,
): readonly string[] {
  return errors ?? getFieldErrors(fieldErrors, fieldName);
}

export const CONTROL_CLASS =
  "border-line-strong focus:border-ink focus:ring-focus min-h-12 w-full border bg-surface px-4 py-3 text-base outline-none transition-[border-color,background-color] duration-(--duration-quick) placeholder:text-foreground-subtle disabled:cursor-not-allowed disabled:opacity-60";

export function controlClassName(className?: string, hasError = false) {
  return cn(CONTROL_CLASS, hasError && "border-critical focus:border-critical", className);
}

export type TextInputAttributes = InputHTMLAttributes<HTMLInputElement>;
export type TextAreaAttributes = TextareaHTMLAttributes<HTMLTextAreaElement>;
export type SelectAttributes = SelectHTMLAttributes<HTMLSelectElement>;
