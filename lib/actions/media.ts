"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as z from "zod";

import type { ActionResult } from "@/components/admin/action-result";
import { requireAdmin } from "@/lib/auth/require-admin";
import { MEDIA_COLUMNS, mapMediaAsset } from "@/lib/data/media";
import { PORTFOLIO_PUBLIC_BUCKET } from "@/lib/media/upload";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database.generated";
import type { AdminMediaAsset, MediaArchiveInput, MediaUploadInput } from "@/types/content";
import { mediaUploadInputSchema } from "@/lib/validation/media";
import { uuidSchema } from "@/lib/validation/common";

const mediaIdSchema = z.object({ id: uuidSchema }).strict();
const archiveInputSchema = z
  .object({
    id: uuidSchema,
    is_archived: z.boolean(),
  })
  .strict();

const MEDIA_ACTION_ERROR = "The media library could not complete that action.";

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = issue.path[0];
    if (typeof field !== "string") return errors;
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

function logMediaActionError(action: string, error: unknown) {
  console.error(`[media action] ${action}`, error);
}

function toDatabaseInput(input: z.infer<typeof mediaUploadInputSchema>, createdBy: string) {
  return {
    bucket: input.bucket,
    storage_path: input.storage_path,
    media_type: input.media_type,
    alt_text: input.alt_text,
    caption: input.caption,
    photographer: input.photographer,
    width: input.width,
    height: input.height,
    poster_path: input.poster_path,
    mime_type: input.mime_type,
    file_size_bytes: input.file_size_bytes,
    is_archived: false,
    created_by: createdBy,
  } satisfies Database["public"]["Tables"]["media_assets"]["Insert"];
}

function revalidateMediaReferences() {
  revalidatePath("/admin/media");
  revalidatePath("/", "layout");
}

/**
 * Inserts metadata after the browser has uploaded the object directly to
 * Storage. The authenticated server client keeps the metadata mutation behind
 * the same admin/RLS boundary as the rest of the CMS.
 */
export async function createMediaAsset(
  input: MediaUploadInput,
): Promise<ActionResult<AdminMediaAsset>> {
  const parsed = mediaUploadInputSchema.safeParse({
    bucket: input?.bucket,
    storage_path: input?.storagePath,
    media_type: input?.mediaType,
    alt_text: input?.altText,
    caption: input?.caption,
    photographer: input?.photographer,
    width: input?.width,
    height: input?.height,
    poster_path: input?.posterPath,
    mime_type: input?.mimeType,
    file_size_bytes: input?.fileSizeBytes,
  });

  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  let admin: Awaited<ReturnType<typeof requireAdmin>>;
  let supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;

  try {
    admin = await requireAdmin();
    supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("media_assets")
      .insert(toDatabaseInput(parsed.data, admin.userId))
      .select(MEDIA_COLUMNS)
      .single();

    if (error || !data) {
      logMediaActionError("create metadata", error);
      const { error: cleanupError } = await supabase.storage
        .from(PORTFOLIO_PUBLIC_BUCKET)
        .remove([parsed.data.storage_path]);
      if (cleanupError) logMediaActionError("cleanup failed upload", cleanupError);

      return {
        ok: false,
        formError: cleanupError
          ? "Media metadata failed and the uploaded file could not be cleaned up. Contact an administrator with the selected filename."
          : "Media metadata could not be saved. The uploaded file was cleaned up; try again.",
      };
    }

    revalidateMediaReferences();
    return { ok: true, data: mapMediaAsset(data), message: "Media uploaded to the library." };
  } catch (error) {
    logMediaActionError("create metadata", error);
    return { ok: false, formError: MEDIA_ACTION_ERROR };
  }
}

export async function setMediaAssetArchived(
  input: MediaArchiveInput,
): Promise<ActionResult<{ id: string; isArchived: boolean }>> {
  const parsed = archiveInputSchema.safeParse({
    id: input?.id,
    is_archived: input?.isArchived,
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("media_assets")
      .update({ is_archived: parsed.data.is_archived })
      .eq("id", parsed.data.id)
      .select("id, is_archived")
      .maybeSingle();

    if (error) {
      logMediaActionError("archive metadata", error);
      return { ok: false, formError: MEDIA_ACTION_ERROR };
    }

    if (!data) return { ok: false, formError: "That media asset no longer exists." };

    revalidateMediaReferences();
    return {
      ok: true,
      data: { id: data.id, isArchived: data.is_archived },
      message: parsed.data.is_archived ? "Media asset archived." : "Media asset restored.",
    };
  } catch (error) {
    logMediaActionError("archive metadata", error);
    return { ok: false, formError: MEDIA_ACTION_ERROR };
  }
}

interface MediaUsage {
  source: string;
  recordId: string;
}

function addDirectUsage<T extends { id: string | number }>(
  usage: MediaUsage[],
  source: string,
  rows: readonly T[],
) {
  rows.forEach((row) => usage.push({ source, recordId: String(row.id) }));
}

function containsJsonValue(value: Json | undefined, target: string): boolean {
  if (typeof value === "string") return value === target;
  if (Array.isArray(value)) return value.some((item) => containsJsonValue(item, target));
  if (value && typeof value === "object") {
    return Object.values(value).some((item) => containsJsonValue(item, target));
  }
  return false;
}

function readableUsage(usage: readonly MediaUsage[]): string {
  return usage
    .slice(0, 3)
    .map(({ source, recordId }) => `${source} (${recordId})`)
    .join(", ");
}

async function findMediaUsage(
  supabase: SupabaseClient<Database>,
  mediaId: string,
): Promise<MediaUsage[]> {
  const [
    siteSettings,
    pages,
    projects,
    services,
    processSteps,
    explorations,
    explorationMedia,
    pageSections,
    projectSections,
  ] = await Promise.all([
    supabase.from("site_settings").select("id, default_og_media_id"),
    supabase.from("pages").select("id, og_media_id"),
    supabase.from("projects").select("id, hero_media_id, og_media_id"),
    supabase.from("services").select("id, media_id"),
    supabase.from("process_steps").select("id, media_id"),
    supabase.from("explorations").select("id, cover_media_id"),
    supabase.from("exploration_media").select("id, media_id"),
    supabase.from("page_sections").select("id, content, settings"),
    supabase.from("project_sections").select("id, content"),
  ]);

  const results = [
    ["site settings", siteSettings],
    ["pages", pages],
    ["projects", projects],
    ["services", services],
    ["process steps", processSteps],
    ["explorations", explorations],
    ["exploration media", explorationMedia],
    ["page sections", pageSections],
    ["project sections", projectSections],
  ] as const;

  const failed = results.find(([, result]) => result.error);
  if (failed?.[1].error) throw failed[1].error;

  const usage: MediaUsage[] = [];
  (siteSettings.data ?? [])
    .filter((row) => row.default_og_media_id === mediaId)
    .forEach((row) => addDirectUsage(usage, "site settings", [row]));
  (pages.data ?? [])
    .filter((row) => row.og_media_id === mediaId)
    .forEach((row) => addDirectUsage(usage, "page", [row]));
  (projects.data ?? [])
    .filter((row) => row.hero_media_id === mediaId || row.og_media_id === mediaId)
    .forEach((row) => addDirectUsage(usage, "project", [row]));
  (services.data ?? [])
    .filter((row) => row.media_id === mediaId)
    .forEach((row) => addDirectUsage(usage, "service", [row]));
  (processSteps.data ?? [])
    .filter((row) => row.media_id === mediaId)
    .forEach((row) => addDirectUsage(usage, "process step", [row]));
  (explorations.data ?? [])
    .filter((row) => row.cover_media_id === mediaId)
    .forEach((row) => addDirectUsage(usage, "exploration", [row]));
  (explorationMedia.data ?? [])
    .filter((row) => row.media_id === mediaId)
    .forEach((row) => addDirectUsage(usage, "exploration media", [row]));
  (pageSections.data ?? [])
    .filter(
      (row) => containsJsonValue(row.content, mediaId) || containsJsonValue(row.settings, mediaId),
    )
    .forEach((row) => addDirectUsage(usage, "page section", [row]));
  (projectSections.data ?? [])
    .filter((row) => containsJsonValue(row.content, mediaId))
    .forEach((row) => addDirectUsage(usage, "project section", [row]));

  return usage;
}

/**
 * Permanently removes an unused asset's metadata and Storage object. Archive
 * is the normal lifecycle; this action is intentionally stricter and checks
 * every direct FK plus JSON section payload before it can proceed.
 */
export async function hardDeleteMediaAsset(
  input: string | { id: string },
): Promise<ActionResult<{ id: string }>> {
  const parsed = mediaIdSchema.safeParse(typeof input === "string" ? { id: input } : input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data: asset, error: assetError } = await supabase
      .from("media_assets")
      .select("id, bucket, storage_path")
      .eq("id", parsed.data.id)
      .maybeSingle();

    if (assetError) throw assetError;
    if (!asset) return { ok: false, formError: "That media asset no longer exists." };

    const usage = await findMediaUsage(supabase, parsed.data.id);
    if (usage.length > 0) {
      return {
        ok: false,
        formError: `This asset is still referenced by ${readableUsage(usage)}. Archive it instead.`,
      };
    }

    const { error: metadataError } = await supabase
      .from("media_assets")
      .delete()
      .eq("id", parsed.data.id);
    if (metadataError) throw metadataError;

    const { error: storageError } = await supabase.storage
      .from(asset.bucket)
      .remove([asset.storage_path]);
    if (storageError) {
      logMediaActionError("delete storage object", storageError);
      return {
        ok: false,
        formError:
          "Metadata was deleted, but the Storage object could not be removed. Ask an administrator to clean up the object.",
      };
    }

    revalidateMediaReferences();
    return { ok: true, data: { id: parsed.data.id }, message: "Media asset permanently deleted." };
  } catch (error) {
    logMediaActionError("hard delete", error);
    return { ok: false, formError: MEDIA_ACTION_ERROR };
  }
}
