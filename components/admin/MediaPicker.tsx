"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface MediaPickerProps {
  id: string;
  label?: ReactNode;
  description?: ReactNode;
  value: string | null;
  onChange: (mediaId: string | null) => void;
  selectedLabel?: ReactNode;
  emptyLabel?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * Contract-only control for media selection. INT-009 supplies the media
 * library, upload flow, previews, and selection callbacks without changing
 * the editor field API.
 */
export function MediaPicker({
  id,
  label = "Media",
  description,
  value,
  selectedLabel,
  emptyLabel = "No media selected yet.",
  disabled = false,
  className,
}: MediaPickerProps) {
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
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
      <div
        id={id}
        role="group"
        aria-labelledby={label ? `${id}-label` : undefined}
        aria-describedby={descriptionId}
        aria-disabled={disabled || undefined}
        className="border-line-strong bg-surface flex min-h-20 items-center justify-between gap-4 border border-dashed px-4 py-3"
      >
        <p className="type-spec text-foreground-muted">
          {value ? (selectedLabel ?? `Selected media: ${value}`) : emptyLabel}
        </p>
        <span className="type-meta text-foreground-subtle shrink-0">Media library pending</span>
      </div>
    </div>
  );
}
