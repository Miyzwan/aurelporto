import { requireAdmin } from "@/lib/auth/require-admin";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Page, PageSection } from "@/types/content";
import type { Database, Tables } from "@/types/database.generated";
import { parsePageSectionContent } from "@/lib/validation/page-sections";
import { pageRowSchema, pageSectionRowSchema } from "@/lib/validation/pages";
import { settingsSchema } from "@/lib/validation/site";
import type { SupabaseClient } from "@supabase/supabase-js";

import { parseRecord, throwDatabaseError } from "./errors";

export function mapPage(row: Tables<"pages">): Page {
  const page = parseRecord(pageRowSchema, row, row.id, "pages");

  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    navLabel: page.nav_label,
    seoTitle: page.seo_title,
    seoDescription: page.seo_description,
    ogMediaId: page.og_media_id,
    status: page.status,
  };
}

export function mapPageSection(row: Tables<"page_sections">): PageSection {
  const section = parseRecord(pageSectionRowSchema, row, row.id, "page_sections");
  const content = parsePageSectionContent(section.section_type, section.content, section.id);
  const settings = parseRecord(
    settingsSchema,
    section.settings,
    section.id,
    "page_sections.settings",
  );

  return {
    id: section.id,
    pageId: section.page_id,
    sectionKey: section.section_key,
    sectionType: section.section_type,
    content,
    settings,
    sortOrder: section.sort_order,
    isEnabled: section.is_enabled,
    status: section.status,
  };
}

export async function getPublishedPage(slug: string): Promise<Page | null> {
  const { data, error } = await createPublicSupabaseClient()
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throwDatabaseError("published page", error);

  return data ? mapPage(data) : null;
}

export async function getPublishedPages(): Promise<Page[]> {
  const { data, error } = await createPublicSupabaseClient()
    .from("pages")
    .select("*")
    .eq("status", "published")
    .order("slug");
  if (error) throwDatabaseError("published pages", error);

  return (data ?? []).map(mapPage);
}

async function readPageSections(
  client: SupabaseClient<Database>,
  pageId: string,
  publishedOnly: boolean,
): Promise<PageSection[]> {
  let query = client
    .from("page_sections")
    .select("*")
    .eq("page_id", pageId)
    .order("sort_order")
    .order("id");

  if (publishedOnly) {
    query = query.eq("is_enabled", true).eq("status", "published");
  }

  const { data, error } = await query;
  if (error) throwDatabaseError("page sections", error);

  return (data ?? []).map(mapPageSection);
}

export async function getPublishedPageWithSections(
  slug: string,
): Promise<{ page: Page; sections: PageSection[] } | null> {
  const client = createPublicSupabaseClient();
  const { data, error } = await client
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throwDatabaseError("published page", error);
  if (!data) return null;

  const page = mapPage(data);
  const sections = await readPageSections(client, page.id, true);

  return { page, sections };
}

export async function getPublishedPageSections(slug: string): Promise<PageSection[]> {
  const result = await getPublishedPageWithSections(slug);
  return result?.sections ?? [];
}

export async function getAdminPages(): Promise<Page[]> {
  await requireAdmin();
  const { data, error } = await (
    await createServerSupabaseClient()
  )
    .from("pages")
    .select("*")
    .order("title")
    .order("id");
  if (error) throwDatabaseError("admin pages", error);

  return (data ?? []).map(mapPage);
}

export async function getAdminPageBySlug(
  slug: string,
): Promise<{ page: Page; sections: PageSection[] } | null> {
  await requireAdmin();
  const client = await createServerSupabaseClient();
  const { data, error } = await client.from("pages").select("*").eq("slug", slug).maybeSingle();
  if (error) throwDatabaseError("admin page", error);
  if (!data) return null;

  const page = mapPage(data);
  const sections = await readPageSections(client, page.id, false);

  return { page, sections };
}

export async function getAdminPageById(id: string): Promise<Page | null> {
  await requireAdmin();
  const { data, error } = await (
    await createServerSupabaseClient()
  )
    .from("pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throwDatabaseError("admin page", error);

  return data ? mapPage(data) : null;
}

export async function getAdminPageSections(pageId: string): Promise<PageSection[]> {
  await requireAdmin();
  return readPageSections(await createServerSupabaseClient(), pageId, false);
}
