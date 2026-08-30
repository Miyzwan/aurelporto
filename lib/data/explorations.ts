import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getMediaAssetsByIds, indexMediaAssets } from "@/lib/data/media";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AdminExplorationSummary,
  ExplorationMediaItem,
  ExplorationSummary,
  MediaAsset,
} from "@/types/content";
import type { Database, Tables } from "@/types/database.generated";
import { explorationMediaRowSchema, explorationRowSchema } from "@/lib/validation/explorations";

import { parseRecord, throwDatabaseError } from "./errors";

export function mapExploration(
  row: Tables<"explorations">,
  media: Record<string, MediaAsset>,
): AdminExplorationSummary {
  const exploration = parseRecord(explorationRowSchema, row, row.id, "explorations");

  return {
    id: exploration.id,
    slug: exploration.slug,
    title: exploration.title,
    category: exploration.category,
    description: exploration.description,
    year: exploration.year,
    coverMedia: exploration.cover_media_id ? (media[exploration.cover_media_id] ?? null) : null,
    sortOrder: exploration.sort_order,
    status: exploration.status,
  };
}

async function readExplorations(
  supabase: SupabaseClient<Database>,
  publishedOnly: boolean,
): Promise<AdminExplorationSummary[]> {
  let query = supabase.from("explorations").select("*").order("sort_order").order("id");
  if (publishedOnly) query = query.eq("status", "published");

  const { data, error } = await query;
  if (error) throwDatabaseError("explorations", error);

  const rows = data ?? [];
  const media = indexMediaAssets(
    await getMediaAssetsByIds(
      supabase,
      rows.map((row) => row.cover_media_id).filter((id): id is string => Boolean(id)),
    ),
  );

  return rows.map((row) => mapExploration(row, media));
}

export async function getPublishedExplorations(): Promise<ExplorationSummary[]> {
  return readExplorations(createPublicSupabaseClient(), true);
}

export async function getAdminExplorations(): Promise<AdminExplorationSummary[]> {
  await requireAdmin();
  return readExplorations(await createServerSupabaseClient(), false);
}

export async function getAdminExplorationMedia(): Promise<ExplorationMediaItem[]> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("exploration_media")
    .select("*")
    .order("sort_order")
    .order("id");

  if (error) throwDatabaseError("exploration media", error);

  const rows = data ?? [];
  const media = indexMediaAssets(
    await getMediaAssetsByIds(
      supabase,
      rows.map((row) => row.media_id),
    ),
  );

  return rows.map((row) => mapExplorationMedia(row, media));
}

export function mapExplorationMedia(
  row: Tables<"exploration_media">,
  media: Record<string, MediaAsset>,
): ExplorationMediaItem {
  const parsed = parseRecord(explorationMediaRowSchema, row, row.id, "exploration_media");
  return {
    id: parsed.id,
    explorationId: parsed.exploration_id,
    mediaId: parsed.media_id,
    caption: parsed.caption,
    sortOrder: parsed.sort_order,
    media: media[parsed.media_id] ?? null,
  };
}
