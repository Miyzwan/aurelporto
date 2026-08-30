import { requireAdmin } from "@/lib/auth/require-admin";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.generated";
import type { NavigationItem, SiteSettings } from "@/types/content";
import { navigationItemRowSchema, siteSettingsRowSchema } from "@/lib/validation/site";

import { parseRecord, throwDatabaseError, throwNotFound } from "./errors";

function mapSiteSettings(row: Tables<"site_settings">): SiteSettings {
  const settings = parseRecord(siteSettingsRowSchema, row, String(row.id), "site_settings");

  return {
    siteName: settings.site_name,
    professionalRole: settings.professional_role,
    location: settings.location,
    serviceArea: settings.service_area,
    email: settings.email,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    socialLinks: settings.social_links,
    footerText: settings.footer_text,
  };
}

function mapNavigationItem(row: Tables<"navigation_items">): NavigationItem {
  const item = parseRecord(navigationItemRowSchema, row, row.id, "navigation_items");

  return {
    id: item.id,
    label: item.label,
    href: item.href,
    placement: item.placement,
    sortOrder: item.sort_order,
    isVisible: item.is_visible,
    targetBlank: item.target_blank,
  };
}

async function readSiteSettings(
  client: Awaited<ReturnType<typeof createServerSupabaseClient>>,
): Promise<SiteSettings> {
  const { data, error } = await client.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throwDatabaseError("site settings", error);
  if (!data) throwNotFound("site settings");

  return mapSiteSettings(data);
}

async function readNavigation(
  client: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  visibleOnly: boolean,
): Promise<NavigationItem[]> {
  let query = client
    .from("navigation_items")
    .select("*")
    .order("placement")
    .order("sort_order")
    .order("id");
  if (visibleOnly) query = query.eq("is_visible", true);

  const { data, error } = await query;
  if (error) throwDatabaseError("navigation items", error);

  return (data ?? []).map(mapNavigationItem);
}

export async function getPublicSiteSettings(): Promise<SiteSettings> {
  return readSiteSettings(createPublicSupabaseClient());
}

export async function getPublicNavigation(): Promise<NavigationItem[]> {
  return readNavigation(createPublicSupabaseClient(), true);
}

export async function getAdminSiteSettings(): Promise<SiteSettings> {
  await requireAdmin();
  return readSiteSettings(await createServerSupabaseClient());
}

export async function getAdminNavigation(): Promise<NavigationItem[]> {
  await requireAdmin();
  return readNavigation(await createServerSupabaseClient(), false);
}
