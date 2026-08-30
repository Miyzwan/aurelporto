"use client";

import { forwardRef } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";

import { controlClassName, resolveFieldErrors, type FieldErrorProps } from "./form-control";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement>, FieldErrorProps {
  onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, errors, fieldErrors, name, onValueChange, onChange, ...props },
  ref,
) {
  const hasErrors = resolveFieldErrors(errors, fieldErrors, name).length > 0;

  return (
    <input
      {...props}
      ref={ref}
      name={name}
      aria-invalid={hasErrors ? true : props["aria-invalid"]}
      className={controlClassName(className, hasErrors)}
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.target.value, event);
      }}
    />
  );
});

TextInput.displayName = "TextInput";
