"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import type { ActionResult } from "@/components/admin/action-result";
import { requireAdmin } from "@/lib/auth/require-admin";
import { mapPage, mapPageSection } from "@/lib/data/pages";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database.generated";
import { contentStatusSchema, uuidSchema } from "@/lib/validation/common";
import { pageFormSchema, pageSectionFormSchema } from "@/lib/validation/pages";
import { pageSectionContentSchemas } from "@/lib/validation/page-sections";
import type {
  ContentStatus,
  Page,
  PageMetadataMutationInput,
  PageSection,
  PageSectionMutationInput,
} from "@/types/content";

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = issue.path[0];
    if (typeof field !== "string") return errors;
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

export async function updatePageMetadata(
  input: PageMetadataMutationInput & { id: string },
): Promise<ActionResult<Page>> {
  const idParsed = uuidSchema.safeParse(input.id);
  if (!idParsed.success) {
    return { ok: false, formError: "Invalid page identifier." };
  }

  const dbPayload = {
    slug: input.slug,
    title: input.title,
    nav_label: input.navLabel ? input.navLabel.trim() : null,
    seo_title: input.seoTitle ? input.seoTitle.trim() : null,
    seo_description: input.seoDescription ? input.seoDescription.trim() : null,
    og_media_id: input.ogMediaId,
    status: input.status,
  };

  const parsed = pageFormSchema.safeParse(dbPayload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("pages")
      .update(parsed.data)
      .eq("id", idParsed.data)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[updatePageMetadata] update failed:", error);
      return { ok: false, formError: "Could not update page metadata." };
    }

    revalidatePath("/admin/pages");
    revalidatePath(`/admin/pages/${data.slug}`);
    revalidatePath(data.slug === "home" ? "/" : `/${data.slug}`);

    return {
      ok: true,
      data: mapPage(data),
      message: "Page metadata saved.",
    };
  } catch (error) {
    console.error("[updatePageMetadata] unexpected error:", error);
    return { ok: false, formError: "Could not update page metadata." };
  }
}

export async function createPageSection(
  input: PageSectionMutationInput,
): Promise<ActionResult<PageSection>> {
  // Validate content against its specific section schema
  const contentSchema = pageSectionContentSchemas[input.sectionType];
  if (!contentSchema) {
    return { ok: false, formError: `Invalid section type: ${input.sectionType}` };
  }

  const contentParsed = contentSchema.safeParse(input.content);
  if (!contentParsed.success) {
    return { ok: false, fieldErrors: fieldErrors(contentParsed.error) };
  }

  const dbPayload = {
    page_id: input.pageId,
    section_key: input.sectionKey,
    section_type: input.sectionType,
    content: contentParsed.data,
    settings: input.settings ?? {},
    sort_order: input.sortOrder ?? 0,
    is_enabled: input.isEnabled ?? true,
    status: input.status ?? "draft",
  };

  const parsed = pageSectionFormSchema.safeParse(dbPayload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("page_sections")
      .insert(parsed.data as TablesInsert<"page_sections">)
      .select("*, pages(slug)")
      .single();

    if (error || !data) {
      console.error("[createPageSection] insert failed:", error);
      if (error?.code === "23505") {
        return {
          ok: false,
          fieldErrors: { sectionKey: ["A section with this key already exists on this page."] },
        };
      }
      return { ok: false, formError: "Could not create page section." };
    }

    const slug = (data as unknown as { pages?: { slug?: string } }).pages?.slug;
    revalidatePath("/admin/pages");
    if (slug) {
      revalidatePath(`/admin/pages/${slug}`);
      revalidatePath(slug === "home" ? "/" : `/${slug}`);
    }

    return {
      ok: true,
      data: mapPageSection(data),
      message: "Page section created.",
    };
  } catch (error) {
    console.error("[createPageSection] unexpected error:", error);
    return { ok: false, formError: "Could not create page section." };
  }
}

export async function updatePageSection(
  input: PageSectionMutationInput & { id: string },
): Promise<ActionResult<PageSection>> {
  const idParsed = uuidSchema.safeParse(input.id);
  if (!idParsed.success) {
    return { ok: false, formError: "Invalid section identifier." };
  }

  const contentSchema = pageSectionContentSchemas[input.sectionType];
  if (!contentSchema) {
    return { ok: false, formError: `Invalid section type: ${input.sectionType}` };
  }

  const contentParsed = contentSchema.safeParse(input.content);
  if (!contentParsed.success) {
    return { ok: false, fieldErrors: fieldErrors(contentParsed.error) };
  }

  const dbPayload = {
    page_id: input.pageId,
    section_key: input.sectionKey,
    section_type: input.sectionType,
    content: contentParsed.data,
    settings: input.settings ?? {},
    sort_order: input.sortOrder ?? 0,
    is_enabled: input.isEnabled,
    status: input.status,
  };

  const parsed = pageSectionFormSchema.safeParse(dbPayload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("page_sections")
      .update(parsed.data as TablesUpdate<"page_sections">)
      .eq("id", idParsed.data)
      .select("*, pages(slug)")
      .single();

    if (error || !data) {
      console.error("[updatePageSection] update failed:", error);
      if (error?.code === "23505") {
        return {
          ok: false,
          fieldErrors: { sectionKey: ["A section with this key already exists on this page."] },
        };
      }
      return { ok: false, formError: "Could not update page section." };
    }

    const slug = (data as unknown as { pages?: { slug?: string } }).pages?.slug;
    revalidatePath("/admin/pages");
    if (slug) {
      revalidatePath(`/admin/pages/${slug}`);
      revalidatePath(slug === "home" ? "/" : `/${slug}`);
    }

    return {
      ok: true,
      data: mapPageSection(data),
      message: "Page section saved.",
    };
  } catch (error) {
    console.error("[updatePageSection] unexpected error:", error);
    return { ok: false, formError: "Could not update page section." };
  }
}

export async function togglePageSection(
  id: string,
  isEnabled: boolean,
): Promise<ActionResult<PageSection>> {
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return { ok: false, formError: "Invalid section identifier." };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("page_sections")
      .update({ is_enabled: isEnabled })
      .eq("id", idParsed.data)
      .select("*, pages(slug)")
      .single();

    if (error || !data) {
      console.error("[togglePageSection] update failed:", error);
      return { ok: false, formError: "Could not toggle page section visibility." };
    }

    const slug = (data as unknown as { pages?: { slug?: string } }).pages?.slug;
    revalidatePath("/admin/pages");
    if (slug) {
      revalidatePath(`/admin/pages/${slug}`);
      revalidatePath(slug === "home" ? "/" : `/${slug}`);
    }

    return {
      ok: true,
      data: mapPageSection(data),
      message: isEnabled ? "Section enabled." : "Section disabled.",
    };
  } catch (error) {
    console.error("[togglePageSection] unexpected error:", error);
    return { ok: false, formError: "Could not toggle page section visibility." };
  }
}

export async function setPageSectionStatus(
  id: string,
  status: ContentStatus,
): Promise<ActionResult<PageSection>> {
  const idParsed = uuidSchema.safeParse(id);
  const statusParsed = contentStatusSchema.safeParse(status);
  if (!idParsed.success || !statusParsed.success) {
    return { ok: false, formError: "Invalid section status payload." };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("page_sections")
      .update({ status: statusParsed.data })
      .eq("id", idParsed.data)
      .select("*, pages(slug)")
      .single();

    if (error || !data) {
      console.error("[setPageSectionStatus] update failed:", error);
      return { ok: false, formError: "Could not update page section status." };
    }

    const slug = (data as unknown as { pages?: { slug?: string } }).pages?.slug;
    revalidatePath("/admin/pages");
    if (slug) {
      revalidatePath(`/admin/pages/${slug}`);
      revalidatePath(slug === "home" ? "/" : `/${slug}`);
    }

    return {
      ok: true,
      data: mapPageSection(data),
      message: `Section ${statusParsed.data}.`,
    };
  } catch (error) {
    console.error("[setPageSectionStatus] unexpected error:", error);
    return { ok: false, formError: "Could not update page section status." };
  }
}

export async function publishPageSection(id: string): Promise<ActionResult<PageSection>> {
  return setPageSectionStatus(id, "published");
}

export async function archivePageSection(id: string): Promise<ActionResult<PageSection>> {
  return setPageSectionStatus(id, "archived");
}

export async function deletePageSection(id: string): Promise<ActionResult<{ id: string }>> {
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return { ok: false, formError: "Invalid section identifier." };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data: section } = await supabase
      .from("page_sections")
      .select("pages(slug)")
      .eq("id", idParsed.data)
      .single();

    const { error } = await supabase.from("page_sections").delete().eq("id", idParsed.data);

    if (error) {
      console.error("[deletePageSection] delete failed:", error);
      return { ok: false, formError: "Could not delete page section." };
    }

    const slug = (section as unknown as { pages?: { slug?: string } })?.pages?.slug;
    revalidatePath("/admin/pages");
    if (slug) {
      revalidatePath(`/admin/pages/${slug}`);
      revalidatePath(slug === "home" ? "/" : `/${slug}`);
    }

    return {
      ok: true,
      data: { id: idParsed.data },
      message: "Page section deleted.",
    };
  } catch (error) {
    console.error("[deletePageSection] unexpected error:", error);
    return { ok: false, formError: "Could not delete page section." };
  }
}

export async function reorderPageSections(input: {
  pageId: string;
  sectionIds: string[];
}): Promise<ActionResult> {
  const pageIdParsed = uuidSchema.safeParse(input.pageId);
  const sectionIdsParsed = z.array(uuidSchema).safeParse(input.sectionIds);

  if (!pageIdParsed.success || !sectionIdsParsed.success) {
    return { ok: false, formError: "Invalid identifiers for reordering." };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.rpc("reorder_page_sections", {
      p_page_id: pageIdParsed.data,
      p_section_ids: sectionIdsParsed.data,
    });

    if (error) {
      console.error("[reorderPageSections] RPC failed:", error);
      return { ok: false, formError: "Could not reorder page sections." };
    }

    revalidatePath("/admin/pages");
    revalidatePath("/", "layout");

    return { ok: true, message: "Section order updated." };
  } catch (error) {
    console.error("[reorderPageSections] unexpected error:", error);
    return { ok: false, formError: "Could not reorder page sections." };
  }
}
