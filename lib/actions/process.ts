"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as z from "zod";

import type { ActionResult } from "@/components/admin/action-result";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getMediaAssetsByIds, indexMediaAssets } from "@/lib/data/media";
import { mapProcessStep } from "@/lib/data/process";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { contentStatusSchema, uuidSchema } from "@/lib/validation/common";
import { processStepFormSchema } from "@/lib/validation/process";
import type { AdminProcessStep, ContentStatus, ProcessStepMutationInput } from "@/types/content";
import type { Database, Tables } from "@/types/database.generated";

const processInputSchema = z
  .object({
    id: uuidSchema.optional(),
    stepNo: z.number().int(),
    title: z.string(),
    description: z.string(),
    mediaId: uuidSchema.nullable(),
    sortOrder: z.number().int(),
    status: contentStatusSchema,
  })
  .strict();

const processStatusSchema = z.object({ id: uuidSchema, status: contentStatusSchema }).strict();
const processIdSchema = z.object({ id: uuidSchema }).strict();
const processOrderSchema = z
  .array(uuidSchema)
  .max(100)
  .superRefine((ids, context) => {
    if (new Set(ids).size !== ids.length) {
      context.addIssue({ code: "custom", message: "IDs cannot contain duplicates." });
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

function parsedProcessInput(input: ProcessStepMutationInput): ParsedResult<{
  id?: string;
  form: z.infer<typeof processStepFormSchema>;
}> {
  const inputResult = processInputSchema.safeParse(input);
  if (!inputResult.success) {
    return { error: { ok: false, fieldErrors: fieldErrors(inputResult.error) } };
  }

  const formResult = processStepFormSchema.safeParse({
    step_no: inputResult.data.stepNo,
    title: inputResult.data.title,
    description: inputResult.data.description,
    media_id: inputResult.data.mediaId,
    sort_order: inputResult.data.sortOrder,
    status: inputResult.data.status,
  });
  if (!formResult.success) {
    return { error: { ok: false, fieldErrors: fieldErrors(formResult.error) } };
  }

  return { data: { id: inputResult.data.id, form: formResult.data } };
}

async function mapProcess(
  supabase: SupabaseClient<Database>,
  row: Tables<"process_steps">,
): Promise<AdminProcessStep> {
  const media = indexMediaAssets(
    await getMediaAssetsByIds(supabase, row.media_id ? [row.media_id] : []),
  );
  return mapProcessStep(row, media);
}

function revalidateProcess() {
  revalidatePath("/");
  revalidatePath("/process");
  revalidatePath("/admin/process");
}

function logError(action: string, error: unknown) {
  console.error(`[process action] ${action}`, error);
}

export async function createProcessStep(
  input: ProcessStepMutationInput,
): Promise<ActionResult<AdminProcessStep>> {
  const parsed = parsedProcessInput(input);
  if ("error" in parsed) return parsed.error;

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("process_steps")
      .insert(parsed.data.form)
      .select("*")
      .single();
    if (error || !data) {
      logError("create", error);
      return { ok: false, formError: "The process step could not be created." };
    }

    revalidateProcess();
    return { ok: true, data: await mapProcess(supabase, data), message: "Process step created." };
  } catch (error) {
    logError("create", error);
    return { ok: false, formError: "The process step could not be created." };
  }
}

export async function updateProcessStep(
  input: ProcessStepMutationInput & { id: string },
): Promise<ActionResult<AdminProcessStep>> {
  const parsed = parsedProcessInput(input);
  if ("error" in parsed) return parsed.error;
  if (!parsed.data.id) return { ok: false, formError: "A process step ID is required." };

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("process_steps")
      .update(parsed.data.form)
      .eq("id", parsed.data.id)
      .select("*")
      .maybeSingle();
    if (error) {
      logError("update", error);
      return { ok: false, formError: "The process step could not be updated." };
    }
    if (!data) return { ok: false, formError: "That process step no longer exists." };

    revalidateProcess();
    return { ok: true, data: await mapProcess(supabase, data), message: "Process step updated." };
  } catch (error) {
    logError("update", error);
    return { ok: false, formError: "The process step could not be updated." };
  }
}

export async function deleteProcessStep(
  input: string | { id: string },
): Promise<ActionResult<{ id: string }>> {
  const parsed = processIdSchema.safeParse(typeof input === "string" ? { id: input } : input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await requireAdmin();
  try {
    const { error } = await (
      await createServerSupabaseClient()
    )
      .from("process_steps")
      .delete()
      .eq("id", parsed.data.id);
    if (error) {
      logError("delete", error);
      return { ok: false, formError: "The process step could not be deleted." };
    }

    revalidateProcess();
    return { ok: true, data: { id: parsed.data.id }, message: "Process step deleted." };
  } catch (error) {
    logError("delete", error);
    return { ok: false, formError: "The process step could not be deleted." };
  }
}

export async function setProcessStepStatus(input: {
  id: string;
  status: ContentStatus;
}): Promise<ActionResult<AdminProcessStep>> {
  const parsed = processStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("process_steps")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id)
      .select("*")
      .maybeSingle();
    if (error) {
      logError("status", error);
      return { ok: false, formError: "The process step status could not be updated." };
    }
    if (!data) return { ok: false, formError: "That process step no longer exists." };

    revalidateProcess();
    return {
      ok: true,
      data: await mapProcess(supabase, data),
      message: "Process step status updated.",
    };
  } catch (error) {
    logError("status", error);
    return { ok: false, formError: "The process step status could not be updated." };
  }
}

export async function reorderProcessSteps(input: string[]): Promise<ActionResult> {
  const parsed = processOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, formError: "The process step order is invalid." };

  await requireAdmin();
  try {
    const { error } = await (
      await createServerSupabaseClient()
    ).rpc("reorder_process_steps", {
      process_step_ids: parsed.data,
    });
    if (error) {
      logError("reorder", error);
      return { ok: false, formError: "The process step order could not be saved." };
    }

    revalidateProcess();
    return { ok: true, message: "Process step order saved." };
  } catch (error) {
    logError("reorder", error);
    return { ok: false, formError: "The process step order could not be saved." };
  }
}
