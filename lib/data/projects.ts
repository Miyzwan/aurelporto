import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAdmin } from "@/lib/auth/require-admin";
import { getMediaAssetsByIds } from "@/lib/data/media";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { MediaAsset, ProjectDetail, ProjectStatus, ProjectSummary } from "@/types/content";
import type { Tables, Database } from "@/types/database.generated";
import type { ProjectSection, ProjectSectionContent } from "@/types/project-sections";
import { parseProjectSectionContent } from "@/lib/validation/project-sections";
import { projectRowSchema, projectSectionRowSchema } from "@/lib/validation/projects";

import { parseRecord, throwDatabaseError } from "./errors";

export interface PublishedProjectFilters {
  projectType?: string;
  projectStatus?: ProjectStatus;
  featured?: boolean;
  limit?: number;
}

function cappedLimit(value: number | undefined): number {
  return Math.max(1, Math.min(value ?? 100, 100));
}

function mapProjectRow(row: Tables<"projects">): Tables<"projects"> {
  return parseRecord(projectRowSchema, row, row.id, "projects");
}

function mediaFor(id: string | null, media: Record<string, MediaAsset>): MediaAsset | null {
  return id ? (media[id] ?? null) : null;
}

function indexMedia(assets: MediaAsset[]): Record<string, MediaAsset> {
  return Object.fromEntries(assets.map((asset) => [asset.id, asset]));
}

function mapProjectSummary(
  row: Tables<"projects">,
  media: Record<string, MediaAsset>,
): ProjectSummary {
  const project = mapProjectRow(row);

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    year: project.year,
    location: project.location,
    projectType: project.project_type,
    areaSqm: project.area_sqm,
    projectStatus: project.project_status,
    summary: project.summary,
    heroMedia: mediaFor(project.hero_media_id, media),
    featured: project.featured,
    featuredOrder: project.featured_order,
    sortOrder: project.sort_order,
  };
}

function mapProjectDetail(
  row: Tables<"projects">,
  media: Record<string, MediaAsset>,
): ProjectDetail {
  const project = mapProjectRow(row);

  return {
    ...mapProjectSummary(project, media),
    clientType: project.client_type,
    designRole: project.design_role,
    services: project.services,
    seoTitle: project.seo_title,
    seoDescription: project.seo_description,
    ogMedia: mediaFor(project.og_media_id, media),
  };
}

async function readProjectRows(
  supabase: SupabaseClient<Database>,
  filters: PublishedProjectFilters,
  publishedOnly: boolean,
): Promise<Tables<"projects">[]> {
  let query = supabase.from("projects").select("*");

  if (filters.featured) {
    query = query.order("featured_order").order("sort_order").order("id");
  } else {
    query = query.order("sort_order").order("id");
  }

  if (publishedOnly) query = query.eq("status", "published");
  if (filters.projectType) query = query.eq("project_type", filters.projectType);
  if (filters.projectStatus) query = query.eq("project_status", filters.projectStatus);
  if (typeof filters.featured === "boolean") query = query.eq("featured", filters.featured);

  const { data, error } = await query.limit(cappedLimit(filters.limit));
  if (error) throwDatabaseError("projects", error);

  return data ?? [];
}

async function readProjectMedia(
  supabase: SupabaseClient<Database>,
  rows: Tables<"projects">[],
): Promise<Record<string, MediaAsset>> {
  const ids = rows
    .flatMap((row) => [row.hero_media_id, row.og_media_id])
    .filter((id): id is string => Boolean(id));
  return indexMedia(await getMediaAssetsByIds(supabase, ids));
}

export async function getFeaturedProjects(limit = 5): Promise<ProjectSummary[]> {
  return getPublishedProjects({ featured: true, limit });
}

export async function getPublishedProjects(
  filters: PublishedProjectFilters = {},
): Promise<ProjectSummary[]> {
  const supabase = createPublicSupabaseClient();
  const rows = await readProjectRows(supabase, filters, true);
  const media = await readProjectMedia(supabase, rows);

  return rows.map((row) => mapProjectSummary(row, media));
}

export async function getPublishedProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throwDatabaseError("published project", error);
  if (!data) return null;

  const media = await readProjectMedia(supabase, [data]);
  return mapProjectDetail(data, media);
}

export async function getNextPublishedProject(projectId: string): Promise<ProjectSummary | null> {
  const projects = await getPublishedProjects();
  const currentIndex = projects.findIndex((project) => project.id === projectId);

  if (currentIndex === -1 || projects.length === 0) return null;
  return projects[(currentIndex + 1) % projects.length] ?? null;
}

export async function getAdminProjects(): Promise<ProjectDetail[]> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const rows = await readProjectRows(supabase, {}, false);
  const media = await readProjectMedia(supabase, rows);

  return rows.map((row) => mapProjectDetail(row, media));
}

export async function getAdminProjectById(projectId: string): Promise<ProjectDetail | null> {
  await requireAdmin();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (error) throwDatabaseError("admin project", error);
  if (!data) return null;

  const media = await readProjectMedia(supabase, [data]);
  return mapProjectDetail(data, media);
}

function sectionMediaIds(content: ProjectSectionContent): string[] {
  if ("mediaIds" in content) return content.mediaIds;
  if ("pairs" in content) {
    return content.pairs.flatMap((pair) => [pair.beforeMediaId, pair.afterMediaId]);
  }
  if ("items" in content) {
    return content.items.flatMap((item) => ("mediaId" in item ? [item.mediaId] : []));
  }
  return [];
}

async function readProjectSections(
  supabase: SupabaseClient<Database>,
  projectId: string,
  publishedOnly: boolean,
): Promise<ProjectSection[]> {
  let query = supabase
    .from("project_sections")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order")
    .order("id");

  if (publishedOnly) query = query.eq("is_enabled", true);

  const { data, error } = await query;
  if (error) throwDatabaseError("project sections", error);

  const parsedRows = (data ?? []).map((row) => {
    const section = parseRecord(projectSectionRowSchema, row, row.id, "project_sections");
    const content = parseProjectSectionContent(section.section_type, section.content, section.id);

    return { section, content };
  });
  const mediaIds = parsedRows.flatMap(({ content }) => sectionMediaIds(content));
  const media = indexMedia(await getMediaAssetsByIds(supabase, mediaIds));

  return parsedRows.map(({ section, content }) => ({
    id: section.id,
    sectionKey: section.section_key,
    sectionType: section.section_type,
    title: section.title,
    content,
    sortOrder: section.sort_order,
    isEnabled: section.is_enabled,
    media,
  }));
}

export async function getPublishedProjectSections(projectId: string): Promise<ProjectSection[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("status", "published")
    .maybeSingle();
  if (error) throwDatabaseError("published project", error);
  if (!data) return [];

  return readProjectSections(supabase, projectId, true);
}

export async function getAdminProjectSections(projectId: string): Promise<ProjectSection[]> {
  await requireAdmin();
  return readProjectSections(await createServerSupabaseClient(), projectId, false);
}
