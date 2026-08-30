"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as z from "zod";

import type { ActionResult } from "@/components/admin/action-result";
import { requireAdmin } from "@/lib/auth/require-admin";
import { mapServiceDetail } from "@/lib/data/services";
import { getMediaAssetsByIds, indexMediaAssets } from "@/lib/data/media";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { contentStatusSchema, uuidSchema } from "@/lib/validation/common";
import { serviceFormSchema } from "@/lib/validation/services";
import type { AdminServiceDetail, ContentStatus, ServiceMutationInput } from "@/types/content";
import type { Database, Tables } from "@/types/database.generated";

const serviceInputSchema = z
  .object({
    id: uuidSchema.optional(),
    slug: z.string(),
    name: z.string(),
    shortDescription: z.string(),
    fullDescription: z.string(),
    idealClient: z.string(),
    scope: z.array(z.string()).max(100),
    deliverables: z.array(z.string()).max(100),
    included: z.array(z.string()).max(100),
    excluded: z.array(z.string()).max(100),
    typicalProjectTypes: z.array(z.string()).max(100),
    mediaId: uuidSchema.nullable(),
    sortOrder: z.number().int(),
    featured: z.boolean(),
    status: contentStatusSchema,
  })
  .strict();

const serviceStatusSchema = z.object({ id: uuidSchema, status: contentStatusSchema }).strict();
const serviceIdSchema = z.object({ id: uuidSchema }).strict();
const serviceOrderSchema = z
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

function nullableText(value: string) {
  const normalized = value.trim();
  return normalized || null;
}

function textList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function toServiceForm(input: z.infer<typeof serviceInputSchema>) {
  return {
    slug: input.slug,
    name: input.name,
    short_description: input.shortDescription,
    full_description: nullableText(input.fullDescription),
    ideal_client: nullableText(input.idealClient),
    scope: textList(input.scope),
    deliverables: textList(input.deliverables),
    included: textList(input.included),
    excluded: textList(input.excluded),
    typical_project_types: textList(input.typicalProjectTypes),
    media_id: input.mediaId,
    sort_order: input.sortOrder,
    featured: input.featured,
    status: input.status,
  };
}

function parsedServiceInput(input: ServiceMutationInput): ParsedResult<{
  id?: string;
  form: z.infer<typeof serviceFormSchema>;
}> {
  const inputResult = serviceInputSchema.safeParse(input);
  if (!inputResult.success) {
    return { error: { ok: false, fieldErrors: fieldErrors(inputResult.error) } };
  }

  const formResult = serviceFormSchema.safeParse(toServiceForm(inputResult.data));
  if (!formResult.success) {
    return { error: { ok: false, fieldErrors: fieldErrors(formResult.error) } };
  }

  return { data: { id: inputResult.data.id, form: formResult.data } };
}

async function mapService(
  supabase: SupabaseClient<Database>,
  row: Tables<"services">,
): Promise<AdminServiceDetail> {
  const media = indexMediaAssets(
    await getMediaAssetsByIds(supabase, row.media_id ? [row.media_id] : []),
  );
  return mapServiceDetail(row, media);
}

function revalidateServices() {
  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/contact");
  revalidatePath("/admin/services");
}

function logError(action: string, error: unknown) {
  console.error(`[services action] ${action}`, error);
}

export async function createService(
  input: ServiceMutationInput,
): Promise<ActionResult<AdminServiceDetail>> {
  const parsed = parsedServiceInput(input);
  if ("error" in parsed) return parsed.error;

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("services")
      .insert(parsed.data.form)
      .select("*")
      .single();
    if (error || !data) {
      logError("create", error);
      return { ok: false, formError: "The service could not be created." };
    }

    revalidateServices();
    return { ok: true, data: await mapService(supabase, data), message: "Service created." };
  } catch (error) {
    logError("create", error);
    return { ok: false, formError: "The service could not be created." };
  }
}

export async function updateService(
  input: ServiceMutationInput & { id: string },
): Promise<ActionResult<AdminServiceDetail>> {
  const parsed = parsedServiceInput(input);
  if ("error" in parsed) return parsed.error;
  if (!parsed.data.id) return { ok: false, formError: "A service ID is required." };

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("services")
      .update(parsed.data.form)
      .eq("id", parsed.data.id)
      .select("*")
      .maybeSingle();
    if (error) {
      logError("update", error);
      return { ok: false, formError: "The service could not be updated." };
    }
    if (!data) return { ok: false, formError: "That service no longer exists." };

    revalidateServices();
    return { ok: true, data: await mapService(supabase, data), message: "Service updated." };
  } catch (error) {
    logError("update", error);
    return { ok: false, formError: "The service could not be updated." };
  }
}

export async function deleteService(
  input: string | { id: string },
): Promise<ActionResult<{ id: string }>> {
  const parsed = serviceIdSchema.safeParse(typeof input === "string" ? { id: input } : input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await requireAdmin();
  try {
    const { error } = await (
      await createServerSupabaseClient()
    )
      .from("services")
      .delete()
      .eq("id", parsed.data.id);
    if (error) {
      logError("delete", error);
      return { ok: false, formError: "The service could not be deleted." };
    }

    revalidateServices();
    return { ok: true, data: { id: parsed.data.id }, message: "Service deleted." };
  } catch (error) {
    logError("delete", error);
    return { ok: false, formError: "The service could not be deleted." };
  }
}

export async function setServiceStatus(input: {
  id: string;
  status: ContentStatus;
}): Promise<ActionResult<AdminServiceDetail>> {
  const parsed = serviceStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("services")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id)
      .select("*")
      .maybeSingle();
    if (error) {
      logError("status", error);
      return { ok: false, formError: "The service status could not be updated." };
    }
    if (!data) return { ok: false, formError: "That service no longer exists." };

    revalidateServices();
    return { ok: true, data: await mapService(supabase, data), message: "Service status updated." };
  } catch (error) {
    logError("status", error);
    return { ok: false, formError: "The service status could not be updated." };
  }
}

export async function reorderServices(input: string[]): Promise<ActionResult> {
  const parsed = serviceOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, formError: "The service order is invalid." };

  await requireAdmin();
  try {
    const { error } = await (
      await createServerSupabaseClient()
    ).rpc("reorder_services", {
      service_ids: parsed.data,
    });
    if (error) {
      logError("reorder", error);
      return { ok: false, formError: "The service order could not be saved." };
    }

    revalidateServices();
    return { ok: true, message: "Service order saved." };
  } catch (error) {
    logError("reorder", error);
    return { ok: false, formError: "The service order could not be saved." };
  }
}
