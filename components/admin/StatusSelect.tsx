"use client";

import { forwardRef } from "react";
import type { ChangeEvent, ReactNode, SelectHTMLAttributes } from "react";

import { controlClassName, resolveFieldErrors, type FieldErrorProps } from "./form-control";

export interface StatusOption<T extends string = string> {
  value: T;
  label: ReactNode;
  disabled?: boolean;
}

export interface StatusSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>, FieldErrorProps {
  options?: readonly StatusOption[];
  placeholder?: ReactNode;
  onValueChange?: (value: string, event: ChangeEvent<HTMLSelectElement>) => void;
}

export const StatusSelect = forwardRef<HTMLSelectElement, StatusSelectProps>(function StatusSelect(
  {
    className,
    errors,
    fieldErrors,
    name,
    options,
    placeholder,
    children,
    onValueChange,
    onChange,
    ...props
  },
  ref,
) {
  const hasErrors = resolveFieldErrors(errors, fieldErrors, name).length > 0;

  return (
    <select
      {...props}
      ref={ref}
      name={name}
      aria-invalid={hasErrors ? true : props["aria-invalid"]}
      className={controlClassName(className, hasErrors)}
      onChange={(event) => {
        onChange?.(event);
        onValueChange?.(event.target.value, event);
      }}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {options
        ? options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))
        : children}
    </select>
  );
});

StatusSelect.displayName = "StatusSelect";
