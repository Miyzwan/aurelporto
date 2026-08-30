"use client";

import { forwardRef } from "react";
import type { ChangeEvent, TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

import { controlClassName, resolveFieldErrors, type FieldErrorProps } from "./form-control";

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldErrorProps {
  onValueChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { className, errors, fieldErrors, name, onValueChange, onChange, ...props },
  ref,
) {
  const hasErrors = resolveFieldErrors(errors, fieldErrors, name).length > 0;

  return (
    <textarea
      {...props}
      ref={ref}
      name={name}
      rows={props.rows ?? 5}
      aria-invalid={hasErrors ? true : props["aria-invalid"]}
      className={cn(controlClassName("min-h-32 resize-y", hasErrors), className)}
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.target.value, event);
      }}
    />
  );
});

TextArea.displayName = "TextArea";
