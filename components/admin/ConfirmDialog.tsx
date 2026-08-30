"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface ConfirmDialogProps {
  open: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  className?: string;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  pending = false,
  onConfirm,
  onCancel,
  className,
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  const [isConfirming, setIsConfirming] = useState(false);
  const titleId = `${dialogId}-title`;
  const descriptionId = description ? `${dialogId}-description` : undefined;
  const isBusy = pending || isConfirming;

  useEffect(() => {
    if (open) confirmButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isBusy) {
        event.preventDefault();
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isBusy, onCancel, open]);

  async function handleConfirm() {
    if (isBusy) return;
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5" role="presentation">
      <div aria-hidden="true" className="bg-ink/35 absolute inset-0" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn("bg-canvas relative w-full max-w-lg border p-6 shadow-xl", className)}
      >
        <h2 id={titleId} className="font-display text-3xl leading-tight tracking-tight">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="type-spec text-foreground-muted mt-4">
            {description}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={onCancel}
            className="border-line-strong type-meta hover:bg-surface inline-flex min-h-11 items-center border px-4 transition-colors duration-(--duration-quick) disabled:cursor-not-allowed disabled:opacity-55"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            disabled={isBusy}
            aria-busy={isBusy}
            onClick={() => void handleConfirm()}
            className={cn(
              "type-meta text-warm-white inline-flex min-h-11 items-center px-4 transition-[background-color,transform,opacity] duration-(--duration-quick) active:translate-y-px disabled:cursor-wait disabled:opacity-55",
              destructive ? "bg-critical hover:bg-ink" : "bg-ink hover:bg-foreground-muted",
            )}
          >
            {isBusy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
