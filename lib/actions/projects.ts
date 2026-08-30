"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import type { ActionResult } from "@/components/admin/action-result";
import { requireAdmin } from "@/lib/auth/require-admin";
import { mapAdminProjectDetail } from "@/lib/data/projects";
import { parseProjectSectionContent } from "@/lib/validation/project-sections";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database.generated";
import { contentStatusSchema, uuidSchema } from "@/lib/validation/common";
import { projectFormSchema, projectSectionFormSchema } from "@/lib/validation/projects";
import { projectSectionContentSchemas } from "@/lib/validation/project-sections";
import type {
  AdminProjectDetail,
  ContentStatus,
  ProjectMutationInput,
  ProjectSectionMutationInput,
} from "@/types/content";
import type { ProjectSection } from "@/types/project-sections";

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = issue.path[0];
    if (typeof field !== "string") return errors;
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

function validatePublishingRequirements(input: ProjectMutationInput): string | null {
  if (input.status === "published") {
    if (!input.heroMediaId) {
      return "A hero image is required before publishing this project.";
    }
    if (!input.summary || input.summary.trim().length === 0) {
      return "A project summary is required before publishing this project.";
    }
    if (!input.location || input.location.trim().length === 0) {
      return "A location is required before publishing this project.";
    }
    if (!input.projectType || input.projectType.trim().length === 0) {
      return "A project type is required before publishing this project.";
    }
  }
  return null;
}

export async function createProject(
  input: ProjectMutationInput,
): Promise<ActionResult<AdminProjectDetail>> {
  const publishError = validatePublishingRequirements(input);
  if (publishError) {
    return { ok: false, fieldErrors: { heroMediaId: [publishError] } };
  }

  const dbPayload = {
    slug: input.slug,
    title: input.title,
    year: input.year,
    location: input.location,
    project_type: input.projectType,
    area_sqm: input.areaSqm,
    project_status: input.projectStatus,
    client_type: input.clientType ? input.clientType.trim() : null,
    design_role: input.designRole,
    services: input.services,
    summary: input.summary,
    hero_media_id: input.heroMediaId,
    featured: input.featured,
    featured_order: input.featuredOrder,
    sort_order: input.sortOrder,
    seo_title: input.seoTitle ? input.seoTitle.trim() : null,
    seo_description: input.seoDescription ? input.seoDescription.trim() : null,
    og_media_id: input.ogMediaId,
    status: input.status,
  };

  const parsed = projectFormSchema.safeParse(dbPayload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .insert(parsed.data as TablesInsert<"projects">)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[createProject] insert failed:", error);
      if (error?.code === "23505") {
        return {
          ok: false,
          fieldErrors: { slug: ["A project with this slug already exists."] },
        };
      }
      return { ok: false, formError: "Could not create project." };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");

    return {
      ok: true,
      data: mapAdminProjectDetail(data, {}),
      message: "Project created.",
    };
  } catch (error) {
    console.error("[createProject] unexpected error:", error);
    return { ok: false, formError: "Could not create project." };
  }
}

export async function updateProject(
  input: ProjectMutationInput & { id: string },
): Promise<ActionResult<AdminProjectDetail>> {
  const idParsed = uuidSchema.safeParse(input.id);
  if (!idParsed.success) {
    return { ok: false, formError: "Invalid project identifier." };
  }

  const publishError = validatePublishingRequirements(input);
  if (publishError) {
    return { ok: false, fieldErrors: { heroMediaId: [publishError] } };
  }

  const dbPayload = {
    slug: input.slug,
    title: input.title,
    year: input.year,
    location: input.location,
    project_type: input.projectType,
    area_sqm: input.areaSqm,
    project_status: input.projectStatus,
    client_type: input.clientType ? input.clientType.trim() : null,
    design_role: input.designRole,
    services: input.services,
    summary: input.summary,
    hero_media_id: input.heroMediaId,
    featured: input.featured,
    featured_order: input.featuredOrder,
    sort_order: input.sortOrder,
    seo_title: input.seoTitle ? input.seoTitle.trim() : null,
    seo_description: input.seoDescription ? input.seoDescription.trim() : null,
    og_media_id: input.ogMediaId,
    status: input.status,
  };

  const parsed = projectFormSchema.safeParse(dbPayload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("projects")
      .update(parsed.data as TablesUpdate<"projects">)
      .eq("id", idParsed.data)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[updateProject] update failed:", error);
      if (error?.code === "23505") {
        return {
          ok: false,
          fieldErrors: { slug: ["A project with this slug already exists."] },
        };
      }
      return { ok: false, formError: "Could not update project." };
    }

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${data.id}`);
    revalidatePath(`/admin/preview/projects/${data.id}`);
    revalidatePath("/projects");
    revalidatePath(`/projects/${data.slug}`);
    revalidatePath("/");

    return {
      ok: true,
      data: mapAdminProjectDetail(data, {}),
      message: "Project saved.",
    };
  } catch (error) {
    console.error("[updateProject] unexpected error:", error);
    return { ok: false, formError: "Could not update project." };
  }
}

export async function setProjectStatus(
  id: string,
  status: ContentStatus,
): Promise<ActionResult<AdminProjectDetail>> {
  const idParsed = uuidSchema.safeParse(id);
  const statusParsed = contentStatusSchema.safeParse(status);
  if (!idParsed.success || !statusParsed.success) {
    return { ok: false, formError: "Invalid project status payload." };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();

    // If publishing, ensure project meets requirements
    if (statusParsed.data === "published") {
      const { data: existing } = await supabase
        .from("projects")
        .select("*")
        .eq("id", idParsed.data)
        .single();

      if (existing && !existing.hero_media_id) {
        return {
          ok: false,
          fieldErrors: {
            heroMediaId: ["A hero image is required before publishing this project."],
          },
        };
      }
    }

    const { data, error } = await supabase
      .from("projects")
      .update({ status: statusParsed.data })
      .eq("id", idParsed.data)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[setProjectStatus] update failed:", error);
      return { ok: false, formError: "Could not update project status." };
    }

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${data.id}`);
    revalidatePath(`/admin/preview/projects/${data.id}`);
    revalidatePath("/projects");
    revalidatePath(`/projects/${data.slug}`);
    revalidatePath("/");

    return {
      ok: true,
      data: mapAdminProjectDetail(data, {}),
      message: `Project ${statusParsed.data}.`,
    };
  } catch (error) {
    console.error("[setProjectStatus] unexpected error:", error);
    return { ok: false, formError: "Could not update project status." };
  }
}

export async function deleteProject(id: string): Promise<ActionResult<{ id: string }>> {
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return { ok: false, formError: "Invalid project identifier." };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data: existing } = await supabase
      .from("projects")
      .select("slug")
      .eq("id", idParsed.data)
      .single();

    const { error } = await supabase.from("projects").delete().eq("id", idParsed.data);

    if (error) {
      console.error("[deleteProject] delete failed:", error);
      return { ok: false, formError: "Could not delete project." };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    if (existing?.slug) {
      revalidatePath(`/projects/${existing.slug}`);
    }
    revalidatePath("/");

    return {
      ok: true,
      data: { id: idParsed.data },
      message: "Project deleted.",
    };
  } catch (error) {
    console.error("[deleteProject] unexpected error:", error);
    return { ok: false, formError: "Could not delete project." };
  }
}

export async function reorderProjects(ids: string[]): Promise<ActionResult> {
  const idsParsed = z.array(uuidSchema).safeParse(ids);
  if (!idsParsed.success) {
    return { ok: false, formError: "Invalid project IDs for reordering." };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.rpc("reorder_projects", {
      project_ids: idsParsed.data,
    });

    if (error) {
      console.error("[reorderProjects] RPC failed:", error);
      return { ok: false, formError: "Could not reorder projects." };
    }

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    revalidatePath("/");

    return { ok: true, message: "Project order updated." };
  } catch (error) {
    console.error("[reorderProjects] unexpected error:", error);
    return { ok: false, formError: "Could not reorder projects." };
  }
}

export async function createProjectSection(
  input: ProjectSectionMutationInput,
): Promise<ActionResult<ProjectSection>> {
  const contentSchema = projectSectionContentSchemas[input.sectionType];
  if (!contentSchema) {
    return { ok: false, formError: `Invalid project section type: ${input.sectionType}` };
  }

  const contentParsed = contentSchema.safeParse(input.content);
  if (!contentParsed.success) {
    return { ok: false, fieldErrors: fieldErrors(contentParsed.error) };
  }

  const dbPayload = {
    project_id: input.projectId,
    section_key: input.sectionKey,
    section_type: input.sectionType,
    title: input.title ? input.title.trim() : null,
    content: contentParsed.data,
    sort_order: input.sortOrder ?? 0,
    is_enabled: input.isEnabled ?? true,
  };

  const parsed = projectSectionFormSchema.safeParse(dbPayload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("project_sections")
      .insert(parsed.data as TablesInsert<"project_sections">)
      .select("*, projects(slug)")
      .single();

    if (error || !data) {
      console.error("[createProjectSection] insert failed:", error);
      if (error?.code === "23505") {
        return {
          ok: false,
          fieldErrors: { sectionKey: ["A section with this key already exists on this project."] },
        };
      }
      return { ok: false, formError: "Could not create project section." };
    }

    const slug = (data as unknown as { projects?: { slug?: string } }).projects?.slug;
    revalidatePath(`/admin/projects/${data.project_id}`);
    revalidatePath(`/admin/preview/projects/${data.project_id}`);
    if (slug) {
      revalidatePath(`/projects/${slug}`);
    }

    return {
      ok: true,
      data: {
        id: data.id,
        sectionKey: data.section_key,
        sectionType: data.section_type,
        title: data.title,
        content: parseProjectSectionContent(data.section_type, data.content, data.id),
        sortOrder: data.sort_order,
        isEnabled: data.is_enabled,
        media: {},
      },
      message: "Section created.",
    };
  } catch (error) {
    console.error("[createProjectSection] unexpected error:", error);
    return { ok: false, formError: "Could not create project section." };
  }
}

export async function updateProjectSection(
  input: ProjectSectionMutationInput & { id: string },
): Promise<ActionResult<ProjectSection>> {
  const idParsed = uuidSchema.safeParse(input.id);
  if (!idParsed.success) {
    return { ok: false, formError: "Invalid section identifier." };
  }

  const contentSchema = projectSectionContentSchemas[input.sectionType];
  if (!contentSchema) {
    return { ok: false, formError: `Invalid project section type: ${input.sectionType}` };
  }

  const contentParsed = contentSchema.safeParse(input.content);
  if (!contentParsed.success) {
    return { ok: false, fieldErrors: fieldErrors(contentParsed.error) };
  }

  const dbPayload = {
    project_id: input.projectId,
    section_key: input.sectionKey,
    section_type: input.sectionType,
    title: input.title ? input.title.trim() : null,
    content: contentParsed.data,
    sort_order: input.sortOrder ?? 0,
    is_enabled: input.isEnabled,
  };

  const parsed = projectSectionFormSchema.safeParse(dbPayload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("project_sections")
      .update(parsed.data as TablesUpdate<"project_sections">)
      .eq("id", idParsed.data)
      .select("*, projects(slug)")
      .single();

    if (error || !data) {
      console.error("[updateProjectSection] update failed:", error);
      if (error?.code === "23505") {
        return {
          ok: false,
          fieldErrors: { sectionKey: ["A section with this key already exists on this project."] },
        };
      }
      return { ok: false, formError: "Could not update project section." };
    }

    const slug = (data as unknown as { projects?: { slug?: string } }).projects?.slug;
    revalidatePath(`/admin/projects/${data.project_id}`);
    revalidatePath(`/admin/preview/projects/${data.project_id}`);
    if (slug) {
      revalidatePath(`/projects/${slug}`);
    }

    return {
      ok: true,
      data: {
        id: data.id,
        sectionKey: data.section_key,
        sectionType: data.section_type,
        title: data.title,
        content: parseProjectSectionContent(data.section_type, data.content, data.id),
        sortOrder: data.sort_order,
        isEnabled: data.is_enabled,
        media: {},
      },
      message: "Section saved.",
    };
  } catch (error) {
    console.error("[updateProjectSection] unexpected error:", error);
    return { ok: false, formError: "Could not update project section." };
  }
}

export async function toggleProjectSection(
  id: string,
  isEnabled: boolean,
): Promise<ActionResult<{ id: string; isEnabled: boolean }>> {
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return { ok: false, formError: "Invalid section identifier." };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("project_sections")
      .update({ is_enabled: isEnabled })
      .eq("id", idParsed.data)
      .select("project_id, projects(slug)")
      .single();

    if (error || !data) {
      console.error("[toggleProjectSection] update failed:", error);
      return { ok: false, formError: "Could not toggle project section visibility." };
    }

    const slug = (data as unknown as { projects?: { slug?: string } }).projects?.slug;
    revalidatePath(`/admin/projects/${data.project_id}`);
    revalidatePath(`/admin/preview/projects/${data.project_id}`);
    if (slug) {
      revalidatePath(`/projects/${slug}`);
    }

    return {
      ok: true,
      data: { id: idParsed.data, isEnabled },
      message: isEnabled ? "Section enabled." : "Section disabled.",
    };
  } catch (error) {
    console.error("[toggleProjectSection] unexpected error:", error);
    return { ok: false, formError: "Could not toggle project section visibility." };
  }
}

export async function deleteProjectSection(id: string): Promise<ActionResult<{ id: string }>> {
  const idParsed = uuidSchema.safeParse(id);
  if (!idParsed.success) {
    return { ok: false, formError: "Invalid section identifier." };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data: section } = await supabase
      .from("project_sections")
      .select("project_id, projects(slug)")
      .eq("id", idParsed.data)
      .single();

    const { error } = await supabase.from("project_sections").delete().eq("id", idParsed.data);

    if (error) {
      console.error("[deleteProjectSection] delete failed:", error);
      return { ok: false, formError: "Could not delete project section." };
    }

    if (section) {
      revalidatePath(`/admin/projects/${section.project_id}`);
      revalidatePath(`/admin/preview/projects/${section.project_id}`);
      const slug = (section as unknown as { projects?: { slug?: string } })?.projects?.slug;
      if (slug) {
        revalidatePath(`/projects/${slug}`);
      }
    }

    return {
      ok: true,
      data: { id: idParsed.data },
      message: "Section deleted.",
    };
  } catch (error) {
    console.error("[deleteProjectSection] unexpected error:", error);
    return { ok: false, formError: "Could not delete project section." };
  }
}

export async function reorderProjectSections(input: {
  projectId: string;
  sectionIds: string[];
}): Promise<ActionResult> {
  const projectIdParsed = uuidSchema.safeParse(input.projectId);
  const sectionIdsParsed = z.array(uuidSchema).safeParse(input.sectionIds);

  if (!projectIdParsed.success || !sectionIdsParsed.success) {
    return { ok: false, formError: "Invalid identifiers for reordering." };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.rpc("reorder_project_sections", {
      p_project_id: projectIdParsed.data,
      p_section_ids: sectionIdsParsed.data,
    });

    if (error) {
      console.error("[reorderProjectSections] RPC failed:", error);
      return { ok: false, formError: "Could not reorder project sections." };
    }

    revalidatePath(`/admin/projects/${projectIdParsed.data}`);
    revalidatePath(`/admin/preview/projects/${projectIdParsed.data}`);
    revalidatePath("/projects");

    return { ok: true, message: "Section order updated." };
  } catch (error) {
    console.error("[reorderProjectSections] unexpected error:", error);
    return { ok: false, formError: "Could not reorder project sections." };
  }
}
