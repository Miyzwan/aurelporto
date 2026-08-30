"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

import { resolveFieldErrors, type FieldErrorProps } from "./form-control";
import { TextInput } from "./TextInput";

export interface ArrayFieldProps extends FieldErrorProps {
  id: string;
  name?: string;
  label?: ReactNode;
  description?: ReactNode;
  value: readonly string[];
  onChange: (value: string[]) => void;
  itemLabel?: string | ((index: number) => string);
  placeholder?: string;
  addLabel?: string;
  removeLabel?: string;
  minItems?: number;
  maxItems?: number;
  disabled?: boolean;
  className?: string;
}

export function ArrayField({
  id,
  name,
  label,
  description,
  value,
  onChange,
  errors,
  fieldErrors,
  itemLabel = "Item",
  placeholder,
  addLabel = "Add item",
  removeLabel = "Remove item",
  minItems = 0,
  maxItems,
  disabled = false,
  className,
}: ArrayFieldProps) {
  const resolvedErrors = resolveFieldErrors(errors, fieldErrors, name);
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = resolvedErrors.length > 0 ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const canRemove = value.length > minItems;
  const canAdd = maxItems === undefined || value.length < maxItems;

  function updateItem(index: number, nextValue: string) {
    const next = [...value];
    next[index] = nextValue;
    onChange(next);
  }

  function addItem() {
    if (!canAdd) return;
    onChange([...value, ""]);
  }

  function removeItem(index: number) {
    if (!canRemove) return;
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {label ? (
        <p id={`${id}-label`} className="type-meta text-foreground-muted">
          {label}
        </p>
      ) : null}
      {description ? (
        <p id={descriptionId} className="type-spec text-foreground-muted">
          {description}
        </p>
      ) : null}

      <ul aria-labelledby={label ? `${id}-label` : undefined} className="flex flex-col gap-3">
        {value.map((item, index) => {
          const itemName = typeof itemLabel === "function" ? itemLabel(index) : itemLabel;
          const inputId = `${id}-${index}`;

          return (
            <li key={inputId} className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <label htmlFor={inputId} className="sr-only">
                  {itemName} {index + 1}
                </label>
                <TextInput
                  id={inputId}
                  name={name ? `${name}[${index}]` : undefined}
                  value={item}
                  placeholder={placeholder}
                  disabled={disabled}
                  errors={resolvedErrors}
                  aria-describedby={describedBy}
                  onValueChange={(nextValue) => updateItem(index, nextValue)}
                />
              </div>
              <button
                type="button"
                aria-label={`${removeLabel} ${index + 1}`}
                disabled={disabled || !canRemove}
                onClick={() => removeItem(index)}
                className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex min-h-12 shrink-0 items-center border px-3 transition-colors duration-(--duration-quick) disabled:cursor-not-allowed disabled:opacity-45"
              >
                {removeLabel}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        disabled={disabled || !canAdd}
        onClick={addItem}
        className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex min-h-11 items-center self-start border px-4 transition-colors duration-(--duration-quick) disabled:cursor-not-allowed disabled:opacity-45"
      >
        {addLabel}
      </button>

      {resolvedErrors.length > 0 ? (
        <div id={errorId} role="alert" aria-live="polite" className="type-spec text-critical">
          {resolvedErrors.length === 1 ? (
            resolvedErrors[0]
          ) : (
            <ul className="list-disc space-y-1 pl-5">
              {resolvedErrors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
