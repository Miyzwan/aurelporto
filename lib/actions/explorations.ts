"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as z from "zod";

import type { ActionResult } from "@/components/admin/action-result";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getMediaAssetsByIds, indexMediaAssets } from "@/lib/data/media";
import { mapExploration, mapExplorationMedia } from "@/lib/data/explorations";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { contentStatusSchema, uuidSchema } from "@/lib/validation/common";
import { explorationFormSchema, explorationMediaFormSchema } from "@/lib/validation/explorations";
import type {
  AdminExplorationSummary,
  ContentStatus,
  ExplorationMediaItem,
  ExplorationMediaMutationInput,
  ExplorationMediaSyncInput,
  ExplorationMutationInput,
} from "@/types/content";
import type { Database, Tables } from "@/types/database.generated";

const explorationInputSchema = z
  .object({
    id: uuidSchema.optional(),
    slug: z.string(),
    title: z.string(),
    category: z.string(),
    description: z.string(),
    year: z.number().int().nullable(),
    coverMediaId: uuidSchema.nullable(),
    sortOrder: z.number().int(),
    status: contentStatusSchema,
  })
  .strict();

const explorationStatusSchema = z.object({ id: uuidSchema, status: contentStatusSchema }).strict();
const explorationIdSchema = z.object({ id: uuidSchema }).strict();
const explorationOrderSchema = z
  .array(uuidSchema)
  .max(100)
  .superRefine((ids, context) => {
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: "custom", message: "IDs cannot contain duplicates." });
    }
  });

const explorationMediaInputSchema = z
  .object({
    id: uuidSchema.optional(),
    explorationId: uuidSchema,
    mediaId: uuidSchema,
    caption: z.string(),
    sortOrder: z.number().int(),
  })
  .strict();

const explorationMediaUpdateSchema = explorationMediaInputSchema.extend({ id: uuidSchema });
const explorationMediaSyncSchema = z
  .object({
    explorationId: uuidSchema,
    items: z
      .array(
        z
          .object({
            // New editor rows have a local ID; the database ID is resolved by media_id.
            id: z.string().optional(),
            explorationId: uuidSchema,
            mediaId: uuidSchema,
            caption: z.string(),
            sortOrder: z.number().int(),
          })
          .strict(),
      )
      .max(100),
  })
  .strict()
  .superRefine((input, context) => {
    if (input.items.some((item) => item.explorationId !== input.explorationId)) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message: "Every media item must belong to the selected exploration.",
      });
    }
    const mediaIds = input.items.map((item) => item.mediaId);
    if (new Set(mediaIds).size !== mediaIds.length) {
      context.addIssue({
        code: "custom",
        path: ["items"],
        message: "An exploration cannot attach the same media asset twice.",
      });
    }
  });

const explorationMediaOrderSchema = z
  .object({ explorationId: uuidSchema, ids: z.array(uuidSchema).max(100) })
  .strict()
  .superRefine((input, context) => {
    if (new Set(input.ids).size !== input.ids.length) {
      context.addIssue({
        code: "custom",
        path: ["ids"],
        message: "IDs cannot contain duplicates.",
      });
    }
  });

type ParsedResult<T> = { data: T } | { error: ActionResult<never> };

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = issue.path[0];
    if (typeof field !== "string") return errors;
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

function nullableText(value: string) {
  const normalized = value.trim();
  return normalized || null;
}

function parsedExplorationInput(input: ExplorationMutationInput): ParsedResult<{
  id?: string;
  form: z.infer<typeof explorationFormSchema>;
}> {
  const inputResult = explorationInputSchema.safeParse(input);
  if (!inputResult.success) {
    return { error: { ok: false, fieldErrors: fieldErrors(inputResult.error) } };
  }

  const formResult = explorationFormSchema.safeParse({
    slug: inputResult.data.slug,
    title: inputResult.data.title,
    category: inputResult.data.category,
    description: nullableText(inputResult.data.description),
    year: inputResult.data.year,
    cover_media_id: inputResult.data.coverMediaId,
    sort_order: inputResult.data.sortOrder,
    status: inputResult.data.status,
  });
  if (!formResult.success) {
    return { error: { ok: false, fieldErrors: fieldErrors(formResult.error) } };
  }

  return { data: { id: inputResult.data.id, form: formResult.data } };
}

async function mapAdminExploration(
  supabase: SupabaseClient<Database>,
  row: Tables<"explorations">,
): Promise<AdminExplorationSummary> {
  const media = indexMediaAssets(
    await getMediaAssetsByIds(supabase, row.cover_media_id ? [row.cover_media_id] : []),
  );
  return mapExploration(row, media);
}

async function readExplorationMedia(
  supabase: SupabaseClient<Database>,
  explorationId: string,
): Promise<ExplorationMediaItem[]> {
  const { data, error } = await supabase
    .from("exploration_media")
    .select("*")
    .eq("exploration_id", explorationId)
    .order("sort_order")
    .order("id");
  if (error) throw error;

  const rows = data ?? [];
  const media = indexMediaAssets(
    await getMediaAssetsByIds(
      supabase,
      rows.map((row) => row.media_id),
    ),
  );
  return rows.map((row) => mapExplorationMedia(row, media));
}

function parsedExplorationMediaInput(input: ExplorationMediaMutationInput): ParsedResult<{
  id?: string;
  form: z.infer<typeof explorationMediaFormSchema>;
}> {
  const inputResult = explorationMediaInputSchema.safeParse(input);
  if (!inputResult.success) {
    return { error: { ok: false, fieldErrors: fieldErrors(inputResult.error) } };
  }

  const formResult = explorationMediaFormSchema.safeParse({
    exploration_id: inputResult.data.explorationId,
    media_id: inputResult.data.mediaId,
    caption: nullableText(inputResult.data.caption),
    sort_order: inputResult.data.sortOrder,
  });
  if (!formResult.success) {
    return { error: { ok: false, fieldErrors: fieldErrors(formResult.error) } };
  }

  return { data: { id: inputResult.data.id, form: formResult.data } };
}

function revalidateExplorations() {
  revalidatePath("/explorations");
  revalidatePath("/admin/explorations");
}

function logError(action: string, error: unknown) {
  console.error(`[explorations action] ${action}`, error);
}

export async function createExploration(
  input: ExplorationMutationInput,
): Promise<ActionResult<AdminExplorationSummary>> {
  const parsed = parsedExplorationInput(input);
  if ("error" in parsed) return parsed.error;

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("explorations")
      .insert(parsed.data.form)
      .select("*")
      .single();
    if (error || !data) {
      logError("create", error);
      return { ok: false, formError: "The exploration could not be created." };
    }

    revalidateExplorations();
    return {
      ok: true,
      data: await mapAdminExploration(supabase, data),
      message: "Exploration created.",
    };
  } catch (error) {
    logError("create", error);
    return { ok: false, formError: "The exploration could not be created." };
  }
}

export async function updateExploration(
  input: ExplorationMutationInput & { id: string },
): Promise<ActionResult<AdminExplorationSummary>> {
  const parsed = parsedExplorationInput(input);
  if ("error" in parsed) return parsed.error;
  if (!parsed.data.id) return { ok: false, formError: "An exploration ID is required." };

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("explorations")
      .update(parsed.data.form)
      .eq("id", parsed.data.id)
      .select("*")
      .maybeSingle();
    if (error) {
      logError("update", error);
      return { ok: false, formError: "The exploration could not be updated." };
    }
    if (!data) return { ok: false, formError: "That exploration no longer exists." };

    revalidateExplorations();
    return {
      ok: true,
      data: await mapAdminExploration(supabase, data),
      message: "Exploration updated.",
    };
  } catch (error) {
    logError("update", error);
    return { ok: false, formError: "The exploration could not be updated." };
  }
}

export async function deleteExploration(
  input: string | { id: string },
): Promise<ActionResult<{ id: string }>> {
  const parsed = explorationIdSchema.safeParse(typeof input === "string" ? { id: input } : input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await requireAdmin();
  try {
    const { error } = await (
      await createServerSupabaseClient()
    )
      .from("explorations")
      .delete()
      .eq("id", parsed.data.id);
    if (error) {
      logError("delete", error);
      return { ok: false, formError: "The exploration could not be deleted." };
    }

    revalidateExplorations();
    return { ok: true, data: { id: parsed.data.id }, message: "Exploration deleted." };
  } catch (error) {
    logError("delete", error);
    return { ok: false, formError: "The exploration could not be deleted." };
  }
}

export async function setExplorationStatus(input: {
  id: string;
  status: ContentStatus;
}): Promise<ActionResult<AdminExplorationSummary>> {
  const parsed = explorationStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("explorations")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id)
      .select("*")
      .maybeSingle();
    if (error) {
      logError("status", error);
      return { ok: false, formError: "The exploration status could not be updated." };
    }
    if (!data) return { ok: false, formError: "That exploration no longer exists." };

    revalidateExplorations();
    return {
      ok: true,
      data: await mapAdminExploration(supabase, data),
      message: "Exploration status updated.",
    };
  } catch (error) {
    logError("status", error);
    return { ok: false, formError: "The exploration status could not be updated." };
  }
}

export async function reorderExplorations(input: string[]): Promise<ActionResult> {
  const parsed = explorationOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, formError: "The exploration order is invalid." };

  await requireAdmin();
  try {
    const { error } = await (
      await createServerSupabaseClient()
    ).rpc("reorder_explorations", {
      exploration_ids: parsed.data,
    });
    if (error) {
      logError("reorder", error);
      return { ok: false, formError: "The exploration order could not be saved." };
    }

    revalidateExplorations();
    return { ok: true, message: "Exploration order saved." };
  } catch (error) {
    logError("reorder", error);
    return { ok: false, formError: "The exploration order could not be saved." };
  }
}

export async function attachExplorationMedia(
  input: ExplorationMediaMutationInput,
): Promise<ActionResult<ExplorationMediaItem>> {
  const parsed = parsedExplorationMediaInput(input);
  if ("error" in parsed) return parsed.error;

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("exploration_media")
      .insert(parsed.data.form)
      .select("*")
      .single();
    if (error || !data) {
      logError("attach media", error);
      return { ok: false, formError: "The exploration media could not be attached." };
    }

    revalidateExplorations();
    const media = indexMediaAssets(await getMediaAssetsByIds(supabase, [data.media_id]));
    return {
      ok: true,
      data: mapExplorationMedia(data, media),
      message: "Exploration media attached.",
    };
  } catch (error) {
    logError("attach media", error);
    return { ok: false, formError: "The exploration media could not be attached." };
  }
}

export async function updateExplorationMedia(
  input: ExplorationMediaMutationInput & { id: string },
): Promise<ActionResult<ExplorationMediaItem>> {
  const parsed = explorationMediaUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  const mediaInput = parsedExplorationMediaInput(parsed.data);
  if ("error" in mediaInput) return mediaInput.error;

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("exploration_media")
      .update(mediaInput.data.form)
      .eq("id", parsed.data.id)
      .select("*")
      .maybeSingle();
    if (error) {
      logError("update media", error);
      return { ok: false, formError: "The exploration media could not be updated." };
    }
    if (!data) return { ok: false, formError: "That exploration media no longer exists." };

    revalidateExplorations();
    const media = indexMediaAssets(await getMediaAssetsByIds(supabase, [data.media_id]));
    return {
      ok: true,
      data: mapExplorationMedia(data, media),
      message: "Exploration media updated.",
    };
  } catch (error) {
    logError("update media", error);
    return { ok: false, formError: "The exploration media could not be updated." };
  }
}

export async function detachExplorationMedia(
  input: string | { id: string },
): Promise<ActionResult<{ id: string }>> {
  const parsed = explorationIdSchema.safeParse(typeof input === "string" ? { id: input } : input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await requireAdmin();
  try {
    const { error } = await (
      await createServerSupabaseClient()
    )
      .from("exploration_media")
      .delete()
      .eq("id", parsed.data.id);
    if (error) {
      logError("detach media", error);
      return { ok: false, formError: "The exploration media could not be detached." };
    }

    revalidateExplorations();
    return { ok: true, data: { id: parsed.data.id }, message: "Exploration media detached." };
  } catch (error) {
    logError("detach media", error);
    return { ok: false, formError: "The exploration media could not be detached." };
  }
}

export async function reorderExplorationMedia(input: {
  explorationId: string;
  ids: string[];
}): Promise<ActionResult<ExplorationMediaItem[]>> {
  const parsed = explorationMediaOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data: existing, error: readError } = await supabase
      .from("exploration_media")
      .select("id")
      .eq("exploration_id", parsed.data.explorationId);
    if (readError) throw readError;

    const existingIds = new Set((existing ?? []).map((row) => row.id));
    if (
      existingIds.size !== parsed.data.ids.length ||
      parsed.data.ids.some((id) => !existingIds.has(id))
    ) {
      return { ok: false, formError: "The exploration media order is out of date." };
    }

    for (const [index, id] of parsed.data.ids.entries()) {
      const { error } = await supabase
        .from("exploration_media")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("exploration_id", parsed.data.explorationId);
      if (error) throw error;
    }

    revalidateExplorations();
    return {
      ok: true,
      data: await readExplorationMedia(supabase, parsed.data.explorationId),
      message: "Exploration media order saved.",
    };
  } catch (error) {
    logError("reorder media", error);
    return { ok: false, formError: "The exploration media order could not be saved." };
  }
}

/** Persists an editor's complete ordered media set without exposing raw JSON. */
export async function syncExplorationMedia(
  input: ExplorationMediaSyncInput,
): Promise<ActionResult<ExplorationMediaItem[]>> {
  const parsed = explorationMediaSyncSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data: exploration, error: explorationError } = await supabase
      .from("explorations")
      .select("id")
      .eq("id", parsed.data.explorationId)
      .maybeSingle();
    if (explorationError) throw explorationError;
    if (!exploration) return { ok: false, formError: "That exploration no longer exists." };

    const { data: existingRows, error: existingError } = await supabase
      .from("exploration_media")
      .select("*")
      .eq("exploration_id", parsed.data.explorationId);
    if (existingError) throw existingError;

    const existingByMediaId = new Map((existingRows ?? []).map((row) => [row.media_id, row]));
    const desiredMediaIds = new Set(parsed.data.items.map((item) => item.mediaId));

    for (const [index, item] of parsed.data.items.entries()) {
      const formResult = explorationMediaFormSchema.safeParse({
        exploration_id: parsed.data.explorationId,
        media_id: item.mediaId,
        caption: nullableText(item.caption),
        sort_order: index,
      });
      if (!formResult.success) return { ok: false, fieldErrors: fieldErrors(formResult.error) };

      const existing = existingByMediaId.get(item.mediaId);
      const result = existing
        ? await supabase.from("exploration_media").update(formResult.data).eq("id", existing.id)
        : await supabase.from("exploration_media").insert(formResult.data);
      if (result.error) throw result.error;
    }

    for (const row of existingRows ?? []) {
      if (desiredMediaIds.has(row.media_id)) continue;
      const { error } = await supabase.from("exploration_media").delete().eq("id", row.id);
      if (error) throw error;
    }

    revalidateExplorations();
    return {
      ok: true,
      data: await readExplorationMedia(supabase, parsed.data.explorationId),
      message: "Exploration media saved.",
    };
  } catch (error) {
    logError("sync media", error);
    return { ok: false, formError: "The exploration media could not be saved." };
  }
}
