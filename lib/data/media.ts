import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, Tables } from "@/types/database.generated";
import type { AdminMediaAsset, MediaAsset } from "@/types/content";

import { parseRecord, throwDatabaseError } from "./errors";
import { mediaAssetRowSchema } from "@/lib/validation/media";

export const MEDIA_COLUMNS =
  "id, bucket, storage_path, media_type, alt_text, caption, photographer, width, height, poster_path, mime_type, file_size_bytes, is_archived, created_by, created_at, updated_at";

export function mapMediaAsset(row: Tables<"media_assets">): AdminMediaAsset {
  const media = parseRecord(mediaAssetRowSchema, row, row.id, "media_assets");

  return {
    id: media.id,
    bucket: media.bucket,
    storagePath: media.storage_path,
    mediaType: media.media_type,
    altText: media.alt_text,
    caption: media.caption,
    photographer: media.photographer,
    width: media.width,
    height: media.height,
    posterPath: media.poster_path,
    mimeType: media.mime_type,
    isArchived: media.is_archived,
    fileSizeBytes: media.file_size_bytes,
    createdAt: media.created_at,
    updatedAt: media.updated_at,
  };
}

async function readMediaAssets(
  supabase: SupabaseClient<Database>,
  ids?: string[],
  { includeArchived = true }: { includeArchived?: boolean } = {},
): Promise<AdminMediaAsset[]> {
  let query = supabase.from("media_assets").select(MEDIA_COLUMNS).order("created_at", {
    ascending: false,
  });

  if (ids && ids.length > 0) {
    query = query.in("id", ids);
  }

  if (!includeArchived) query = query.eq("is_archived", false);

  const { data, error } = await query;
  if (error) throwDatabaseError("media assets", error);

  return (data ?? []).map((row) => mapMediaAsset(row));
}

export async function getPublicMediaAssetsByIds(ids: string[]): Promise<MediaAsset[]> {
  const uniqueIds = [...new Set(ids)].filter(Boolean);
  if (uniqueIds.length === 0) return [];

  return readMediaAssets(createPublicSupabaseClient(), uniqueIds, { includeArchived: true });
}

export async function getMediaAssetsByIds(
  supabase: SupabaseClient<Database>,
  ids: string[],
): Promise<MediaAsset[]> {
  const uniqueIds = [...new Set(ids)].filter(Boolean);
  if (uniqueIds.length === 0) return [];

  return readMediaAssets(supabase, uniqueIds, { includeArchived: true });
}

export async function getAdminMediaAssets(): Promise<AdminMediaAsset[]> {
  await requireAdmin();
  return readMediaAssets(await createServerSupabaseClient());
}

/** Assets shown in editors. Archived files stay resolvable by ID but cannot be newly selected. */
export async function getAdminMediaPickerAssets(): Promise<AdminMediaAsset[]> {
  await requireAdmin();
  return readMediaAssets(await createServerSupabaseClient(), undefined, {
    includeArchived: false,
  });
}

export function indexMediaAssets(assets: MediaAsset[]): Record<string, MediaAsset> {
  return Object.fromEntries(assets.map((asset) => [asset.id, asset]));
}
