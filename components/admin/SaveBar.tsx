"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils/cn";

import type { ActionResult } from "./action-result";

export interface SaveBarProps<T = undefined> {
  hasChanges?: boolean;
  isDirty?: boolean;
  isSaving?: boolean;
  actionResult?: ActionResult<T> | null;
  saveLabel?: string;
  savingLabel?: string;
  cancelLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  status?: ReactNode;
  formId?: string;
  onSave?: () => void | Promise<void>;
  onCancel?: () => void;
  className?: string;
}

export function SaveBar<T>({
  hasChanges,
  isDirty,
  isSaving = false,
  actionResult,
  saveLabel = "Save changes",
  savingLabel = "Saving...",
  cancelLabel = "Discard changes",
  successMessage = "Changes saved.",
  errorMessage = "Changes could not be saved.",
  status,
  formId,
  onSave,
  onCancel,
  className,
}: SaveBarProps<T>) {
  const resultRef = useRef<ActionResult<T> | null>(null);
  const dirty = hasChanges ?? isDirty ?? true;
  const saveDisabled = !dirty || isSaving;

  useEffect(() => {
    if (!actionResult || actionResult === resultRef.current) return;
    resultRef.current = actionResult;

    if (actionResult.ok) {
      toast.success(actionResult.message ?? successMessage);
    } else {
      toast.error(actionResult.formError ?? errorMessage);
    }
  }, [actionResult, errorMessage, successMessage]);

  return (
    <div
      role="region"
      aria-label="Save changes"
      className={cn(
        "border-line bg-canvas/95 sticky bottom-0 z-20 mt-8 flex flex-wrap items-center justify-between gap-4 border-t px-4 py-4 backdrop-blur-sm",
        className,
      )}
    >
      <div className="type-spec text-foreground-muted" aria-live="polite">
        {status ?? (dirty ? "You have unsaved changes." : "All changes are saved.")}
      </div>
      <div className="flex flex-wrap gap-3">
        {onCancel ? (
          <button
            type="button"
            disabled={isSaving}
            onClick={onCancel}
            className="border-line-strong type-meta hover:bg-surface inline-flex min-h-11 items-center border px-4 transition-colors duration-(--duration-quick) disabled:cursor-not-allowed disabled:opacity-55"
          >
            {cancelLabel}
          </button>
        ) : null}
        <button
          type={onSave ? "button" : "submit"}
          form={formId}
          disabled={saveDisabled}
          onClick={onSave ? () => void onSave() : undefined}
          aria-busy={isSaving}
          className="bg-ink text-warm-white hover:bg-foreground-muted type-meta inline-flex min-h-11 items-center px-5 transition-[background-color,transform,opacity] duration-(--duration-quick) active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isSaving ? savingLabel : saveLabel}
        </button>
      </div>
    </div>
  );
}
