"use client";

import Image from "next/image";
import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils/cn";
import { mediaUrl } from "@/lib/media/urls";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import {
  createMediaStoragePath,
  mediaTypeForMime,
  PORTFOLIO_PUBLIC_BUCKET,
  readMediaDimensions,
  validateMediaFile,
} from "@/lib/media/upload";
import type { AdminMediaAsset, MediaArchiveInput, MediaUploadInput } from "@/types/content";

import type { ActionResult } from "./action-result";

export type MediaUploadAction = (input: MediaUploadInput) => Promise<ActionResult<AdminMediaAsset>>;

export type MediaArchiveAction = (
  input: MediaArchiveInput,
) => Promise<ActionResult<{ id: string; isArchived: boolean }>>;

export type MediaHardDeleteAction = (
  input: string | { id: string },
) => Promise<ActionResult<{ id: string }>>;

export interface MediaPickerProps {
  id: string;
  label?: ReactNode;
  description?: ReactNode;
  value: string | null;
  onChange: (mediaId: string | null) => void;
  assets?: readonly AdminMediaAsset[];
  uploadAction?: MediaUploadAction;
  selectedLabel?: ReactNode;
  emptyLabel?: ReactNode;
  disabled?: boolean;
  className?: string;
}

interface UploadDraft {
  altText: string;
  caption: string;
}

function emptyUploadDraft(): UploadDraft {
  return { altText: "", caption: "" };
}

function localDraftAsset(file: File, draft: UploadDraft): AdminMediaAsset {
  const now = new Date().toISOString();
  const mediaType = mediaTypeForMime(file.type) ?? "image";

  return {
    id: `local-${crypto.randomUUID()}`,
    bucket: PORTFOLIO_PUBLIC_BUCKET,
    storagePath: `pending/${file.name}`,
    mediaType,
    altText: draft.altText.trim(),
    caption: draft.caption.trim() || null,
    photographer: null,
    width: null,
    height: null,
    posterPath: null,
    mimeType: file.type,
    isArchived: false,
    fileSizeBytes: file.size,
    createdAt: now,
    updatedAt: now,
  };
}

export interface MediaUploadModalProps {
  open: boolean;
  title?: string;
  submitLabel?: string;
  uploadAction?: MediaUploadAction;
  onCancel: () => void;
  onUploaded: (asset: AdminMediaAsset) => void;
}

/**
 * Uploads the object from the browser, then sends only validated metadata to
 * the Server Action. The fallback draft keeps the primitive usable in isolated
 * component tests; production routes always pass the authenticated action.
 */
export function MediaUploadModal({
  open,
  title = "Upload media",
  submitLabel = "Upload media",
  uploadAction,
  onCancel,
  onUploaded,
}: MediaUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState(emptyUploadDraft);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] ?? null;
    if (!nextFile) return;

    const validationError = validateMediaFile(nextFile);
    setFileError(validationError);
    setFile(validationError ? null : nextFile);
  }

  async function cleanUpObject(storagePath: string) {
    try {
      const { error } = await createBrowserSupabaseClient()
        .storage.from(PORTFOLIO_PUBLIC_BUCKET)
        .remove([storagePath]);
      if (error) console.error("[media upload] cleanup failed", error);
    } catch (error) {
      console.error("[media upload] cleanup failed", error);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setFileError("Choose a supported image or video file first.");
      return;
    }
    if (!draft.altText.trim()) {
      toast.error("Add alt text before uploading the asset.");
      return;
    }

    const validationError = validateMediaFile(file);
    if (validationError) {
      setFileError(validationError);
      return;
    }

    if (!uploadAction) {
      onUploaded(localDraftAsset(file, draft));
      toast.success("Media upload queued as a local draft.");
      onCancel();
      return;
    }

    setIsUploading(true);
    const storagePath = createMediaStoragePath(file.name);
    let objectUploaded = false;

    try {
      const supabase = createBrowserSupabaseClient();
      const { error: storageError } = await supabase.storage
        .from(PORTFOLIO_PUBLIC_BUCKET)
        .upload(storagePath, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });

      if (storageError) {
        toast.error("The file could not be uploaded. Check the file type and your admin session.");
        return;
      }
      objectUploaded = true;

      const dimensions = await readMediaDimensions(file);
      const result = await uploadAction({
        bucket: PORTFOLIO_PUBLIC_BUCKET,
        storagePath,
        mediaType: mediaTypeForMime(file.type) ?? "image",
        altText: draft.altText.trim(),
        caption: draft.caption.trim() || null,
        photographer: null,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
        posterPath: null,
        mimeType: file.type,
        fileSizeBytes: file.size,
      });

      if (!result.ok) {
        await cleanUpObject(storagePath);
        toast.error(result.formError ?? "Media metadata could not be saved.");
        return;
      }

      if (!result.data) {
        await cleanUpObject(storagePath);
        toast.error("Media metadata could not be saved.");
        return;
      }

      onUploaded(result.data);
      toast.success(result.message ?? "Media uploaded to the library.");
      onCancel();
    } catch {
      if (objectUploaded) await cleanUpObject(storagePath);
      toast.error("The media upload could not be completed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5" role="presentation">
      <div aria-hidden="true" className="bg-ink/35 absolute inset-0" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-upload-title"
        className="bg-canvas tablet:p-8 relative w-full max-w-2xl border p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="type-meta text-foreground-muted">New asset</p>
            <h2 id="media-upload-title" className="font-display mt-2 text-4xl">
              {title}
            </h2>
          </div>
          <button
            type="button"
            disabled={isUploading}
            onClick={onCancel}
            className="type-meta text-foreground-muted min-h-11 px-2 disabled:opacity-55"
          >
            Close
          </button>
        </div>

        <form onSubmit={(event) => void submit(event)} className="mt-8 grid gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="media-upload-file" className="type-meta text-foreground-muted">
              File <span aria-hidden="true">*</span>
            </label>
            <p id="media-upload-file-description" className="type-spec text-foreground-muted">
              JPEG, PNG, WebP, AVIF, MP4, or WebM · maximum 80 MB.
            </p>
            <input
              id="media-upload-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm"
              aria-describedby="media-upload-file-description media-upload-file-error"
              aria-invalid={Boolean(fileError) || undefined}
              onChange={selectFile}
              disabled={isUploading}
              className="border-line-strong bg-surface type-spec min-h-12 w-full border px-4 py-3"
            />
            {file ? <p className="type-meta text-foreground-muted">Selected: {file.name}</p> : null}
            {fileError ? (
              <p id="media-upload-file-error" role="alert" className="type-spec text-critical">
                {fileError}
              </p>
            ) : null}
          </div>

          <label className="flex flex-col gap-2">
            <span className="type-meta text-foreground-muted">
              Alt text <span aria-hidden="true">*</span>
            </span>
            <input
              value={draft.altText}
              onChange={(event) =>
                setDraft((current) => ({ ...current, altText: event.target.value }))
              }
              required
              disabled={isUploading}
              placeholder="Warm oak shelving in the reading room"
              className="border-line-strong focus:border-ink focus:ring-focus bg-surface min-h-12 w-full border px-4 py-3 outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="type-meta text-foreground-muted">Caption</span>
            <input
              value={draft.caption}
              onChange={(event) =>
                setDraft((current) => ({ ...current, caption: event.target.value }))
              }
              disabled={isUploading}
              className="border-line-strong focus:border-ink focus:ring-focus bg-surface min-h-12 w-full border px-4 py-3 outline-none"
            />
          </label>

          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={onCancel}
              className="border-line-strong type-meta inline-flex min-h-11 items-center border px-4 disabled:opacity-55"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              aria-busy={isUploading}
              className="bg-ink text-warm-white type-meta inline-flex min-h-11 items-center px-4 disabled:cursor-wait disabled:opacity-55"
            >
              {isUploading ? "Uploading..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MediaThumbnail({ asset }: { asset: AdminMediaAsset }) {
  if (asset.mediaType !== "image") {
    return <span className="type-meta text-foreground-muted">Video</span>;
  }

  return (
    <Image
      src={mediaUrl(asset)}
      alt=""
      fill
      sizes="(min-width: 768px) 12rem, 80vw"
      className="object-cover"
    />
  );
}

/**
 * Selects only the active assets supplied by the server-side repository and
 * keeps upload/selection in one control for service, process, and exploration
 * editors.
 */
export function MediaPicker({
  id,
  label = "Media",
  description,
  value,
  onChange,
  assets,
  uploadAction,
  selectedLabel,
  emptyLabel = "No media selected yet.",
  disabled = false,
  className,
}: MediaPickerProps) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const availableAssets = assets ?? [];
  const [localAssets, setLocalAssets] = useState(() => [...availableAssets]);
  const descriptionId = description ? `${id}-description` : undefined;
  const selectedAsset = localAssets.find((asset) => asset.id === value);
  const hasLibrary = localAssets.length > 0;

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
        className="border-line-strong bg-surface flex min-h-20 flex-col gap-4 border border-dashed px-4 py-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="type-spec text-foreground-muted">
            {value
              ? (selectedAsset?.altText ?? selectedLabel ?? `Selected asset: ${value}`)
              : emptyLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setLibraryOpen(true)}
              className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex min-h-11 items-center border px-3 transition-colors duration-(--duration-quick) disabled:cursor-not-allowed disabled:opacity-55"
            >
              {hasLibrary ? "Choose media" : "Open media library"}
            </button>
            {uploadAction ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => setUploadOpen(true)}
                className="bg-ink text-warm-white type-meta hover:bg-foreground-muted inline-flex min-h-11 items-center px-3 transition-colors duration-(--duration-quick) disabled:cursor-not-allowed disabled:opacity-55"
              >
                Upload
              </button>
            ) : null}
            {value ? (
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(null)}
                className="type-meta text-foreground-muted hover:text-foreground inline-flex min-h-11 items-center px-2 disabled:opacity-55"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
        {!hasLibrary && !uploadAction ? (
          <span className="type-meta text-foreground-subtle">Media library pending</span>
        ) : null}
      </div>

      {libraryOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-5"
          role="presentation"
        >
          <div
            aria-hidden="true"
            className="bg-ink/35 absolute inset-0"
            onClick={() => setLibraryOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-library-title`}
            className="bg-canvas tablet:p-8 relative max-h-[min(42rem,calc(100dvh-2.5rem))] w-full max-w-3xl overflow-y-auto border p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="type-meta text-foreground-muted">Active assets</p>
                <h2 id={`${id}-library-title`} className="font-display mt-2 text-4xl">
                  Choose media
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setLibraryOpen(false)}
                className="type-meta text-foreground-muted min-h-11 px-2"
              >
                Close
              </button>
            </div>

            {hasLibrary ? (
              <ul className="tablet:grid-cols-2 mt-8 grid gap-3" aria-label="Active media assets">
                {localAssets.map((asset) => {
                  const isSelected = asset.id === value;
                  return (
                    <li key={asset.id}>
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          onChange(asset.id);
                          setLibraryOpen(false);
                        }}
                        className={cn(
                          "border-line w-full border p-3 text-left transition-colors duration-(--duration-quick)",
                          isSelected
                            ? "border-ink bg-surface-sunken"
                            : "hover:border-line-strong hover:bg-surface",
                        )}
                      >
                        <div className="bg-surface-sunken relative aspect-[3/2] overflow-hidden">
                          <MediaThumbnail asset={asset} />
                        </div>
                        <span className="type-spec mt-3 block truncate">{asset.altText}</span>
                        <span className="type-meta text-foreground-muted mt-1 block">
                          {asset.mediaType} · {asset.mimeType}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="type-spec text-foreground-muted mt-8">
                No active assets yet. Upload the first one from this editor.
              </p>
            )}
          </div>
        </div>
      ) : null}

      <MediaUploadModal
        key={uploadOpen ? "media-upload-open" : "media-upload-closed"}
        open={uploadOpen}
        title="Upload and select media"
        submitLabel="Upload and select"
        uploadAction={uploadAction}
        onCancel={() => setUploadOpen(false)}
        onUploaded={(asset) => {
          setLocalAssets((current) => [asset, ...current]);
          onChange(asset.id);
        }}
      />
    </div>
  );
}
