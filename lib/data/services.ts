import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getMediaAssetsByIds, indexMediaAssets } from "@/lib/data/media";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AdminServiceDetail,
  MediaAsset,
  ServiceDetail,
  ServiceSummary,
} from "@/types/content";
import type { Database, Tables } from "@/types/database.generated";
import { serviceRowSchema } from "@/lib/validation/services";

import { parseRecord, throwDatabaseError } from "./errors";

function mapServiceRow(row: Tables<"services">): Tables<"services"> {
  return parseRecord(serviceRowSchema, row, row.id, "services");
}

function mapServiceSummary(
  row: Tables<"services">,
  media: Record<string, MediaAsset>,
): ServiceSummary {
  const service = mapServiceRow(row);

  return {
    id: service.id,
    slug: service.slug,
    name: service.name,
    shortDescription: service.short_description,
    media: service.media_id ? (media[service.media_id] ?? null) : null,
    sortOrder: service.sort_order,
  };
}

export function mapServiceDetail(
  row: Tables<"services">,
  media: Record<string, MediaAsset>,
): AdminServiceDetail {
  const service = mapServiceRow(row);

  return {
    ...mapServiceSummary(service, media),
    fullDescription: service.full_description,
    idealClient: service.ideal_client,
    scope: service.scope,
    deliverables: service.deliverables,
    included: service.included,
    excluded: service.excluded,
    typicalProjectTypes: service.typical_project_types,
    featured: service.featured,
    status: service.status,
  };
}

async function readServices(
  supabase: SupabaseClient<Database>,
  publishedOnly: boolean,
): Promise<AdminServiceDetail[]> {
  let query = supabase.from("services").select("*").order("sort_order").order("id");
  if (publishedOnly) query = query.eq("status", "published");

  const { data, error } = await query;
  if (error) throwDatabaseError("services", error);

  const rows = data ?? [];
  const media = indexMediaAssets(
    await getMediaAssetsByIds(
      supabase,
      rows.map((row) => row.media_id).filter((id): id is string => Boolean(id)),
    ),
  );

  return rows.map((row) => mapServiceDetail(row, media));
}

export async function getPublishedServices(): Promise<ServiceSummary[]> {
  const services = await readServices(createPublicSupabaseClient(), true);
  return services.map(({ id, slug, name, shortDescription, media, sortOrder }) => ({
    id,
    slug,
    name,
    shortDescription,
    media,
    sortOrder,
  }));
}

export async function getPublishedServiceDetails(): Promise<ServiceDetail[]> {
  return readServices(createPublicSupabaseClient(), true);
}

export async function getAdminServices(): Promise<AdminServiceDetail[]> {
  await requireAdmin();
  return readServices(await createServerSupabaseClient(), false);
}
