import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getMediaAssetsByIds, indexMediaAssets } from "@/lib/data/media";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AdminProcessStep, MediaAsset, ProcessStep } from "@/types/content";
import type { Database, Tables } from "@/types/database.generated";
import { processStepRowSchema } from "@/lib/validation/process";

import { parseRecord, throwDatabaseError } from "./errors";

export function mapProcessStep(
  row: Tables<"process_steps">,
  media: Record<string, MediaAsset>,
): AdminProcessStep {
  const step = parseRecord(processStepRowSchema, row, row.id, "process_steps");

  return {
    id: step.id,
    stepNo: step.step_no,
    title: step.title,
    description: step.description,
    media: step.media_id ? (media[step.media_id] ?? null) : null,
    sortOrder: step.sort_order,
    status: step.status,
  };
}

async function readProcessSteps(
  supabase: SupabaseClient<Database>,
  publishedOnly: boolean,
): Promise<AdminProcessStep[]> {
  let query = supabase.from("process_steps").select("*").order("sort_order").order("id");
  if (publishedOnly) query = query.eq("status", "published");

  const { data, error } = await query;
  if (error) throwDatabaseError("process steps", error);

  const rows = data ?? [];
  const media = indexMediaAssets(
    await getMediaAssetsByIds(
      supabase,
      rows.map((row) => row.media_id).filter((id): id is string => Boolean(id)),
    ),
  );

  return rows.map((row) => mapProcessStep(row, media));
}

export async function getPublishedProcessSteps(): Promise<ProcessStep[]> {
  return readProcessSteps(createPublicSupabaseClient(), true);
}

export async function getAdminProcessSteps(): Promise<AdminProcessStep[]> {
  await requireAdmin();
  return readProcessSteps(await createServerSupabaseClient(), false);
}
