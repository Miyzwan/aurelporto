"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import type { ActionResult } from "@/components/admin/action-result";
import { requireAdmin } from "@/lib/auth/require-admin";
import { mapTestimonial } from "@/lib/data/testimonials";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { contentStatusSchema, uuidSchema } from "@/lib/validation/common";
import { testimonialFormSchema } from "@/lib/validation/testimonials";
import type { AdminTestimonial, ContentStatus, TestimonialMutationInput } from "@/types/content";

const testimonialInputSchema = z
  .object({
    id: uuidSchema.optional(),
    clientName: z.string(),
    clientRole: z.string(),
    projectName: z.string(),
    quote: z.string(),
    sortOrder: z.number().int(),
    featured: z.boolean(),
    status: contentStatusSchema,
  })
  .strict();

const testimonialStatusSchema = z.object({ id: uuidSchema, status: contentStatusSchema }).strict();
const testimonialFeaturedSchema = z.object({ id: uuidSchema, featured: z.boolean() }).strict();
const testimonialIdSchema = z.object({ id: uuidSchema }).strict();
const testimonialOrderSchema = z
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

function parsedTestimonialInput(input: TestimonialMutationInput): ParsedResult<{
  id?: string;
  form: z.infer<typeof testimonialFormSchema>;
}> {
  const inputResult = testimonialInputSchema.safeParse(input);
  if (!inputResult.success) {
    return { error: { ok: false, fieldErrors: fieldErrors(inputResult.error) } };
  }

  const formResult = testimonialFormSchema.safeParse({
    client_name: inputResult.data.clientName,
    client_role: nullableText(inputResult.data.clientRole),
    project_name: nullableText(inputResult.data.projectName),
    quote: inputResult.data.quote,
    sort_order: inputResult.data.sortOrder,
    featured: inputResult.data.featured,
    status: inputResult.data.status,
  });
  if (!formResult.success) {
    return { error: { ok: false, fieldErrors: fieldErrors(formResult.error) } };
  }

  return { data: { id: inputResult.data.id, form: formResult.data } };
}

function revalidateTestimonials() {
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

function logError(action: string, error: unknown) {
  console.error(`[testimonials action] ${action}`, error);
}

export async function createTestimonial(
  input: TestimonialMutationInput,
): Promise<ActionResult<AdminTestimonial>> {
  const parsed = parsedTestimonialInput(input);
  if ("error" in parsed) return parsed.error;

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("testimonials")
      .insert(parsed.data.form)
      .select("*")
      .single();
    if (error || !data) {
      logError("create", error);
      return { ok: false, formError: "The testimonial could not be created." };
    }

    revalidateTestimonials();
    return { ok: true, data: mapTestimonial(data), message: "Testimonial created." };
  } catch (error) {
    logError("create", error);
    return { ok: false, formError: "The testimonial could not be created." };
  }
}

export async function updateTestimonial(
  input: TestimonialMutationInput & { id: string },
): Promise<ActionResult<AdminTestimonial>> {
  const parsed = parsedTestimonialInput(input);
  if ("error" in parsed) return parsed.error;
  if (!parsed.data.id) return { ok: false, formError: "A testimonial ID is required." };

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("testimonials")
      .update(parsed.data.form)
      .eq("id", parsed.data.id)
      .select("*")
      .maybeSingle();
    if (error) {
      logError("update", error);
      return { ok: false, formError: "The testimonial could not be updated." };
    }
    if (!data) return { ok: false, formError: "That testimonial no longer exists." };

    revalidateTestimonials();
    return { ok: true, data: mapTestimonial(data), message: "Testimonial updated." };
  } catch (error) {
    logError("update", error);
    return { ok: false, formError: "The testimonial could not be updated." };
  }
}

export async function deleteTestimonial(
  input: string | { id: string },
): Promise<ActionResult<{ id: string }>> {
  const parsed = testimonialIdSchema.safeParse(typeof input === "string" ? { id: input } : input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await requireAdmin();
  try {
    const { error } = await (
      await createServerSupabaseClient()
    )
      .from("testimonials")
      .delete()
      .eq("id", parsed.data.id);
    if (error) {
      logError("delete", error);
      return { ok: false, formError: "The testimonial could not be deleted." };
    }

    revalidateTestimonials();
    return { ok: true, data: { id: parsed.data.id }, message: "Testimonial deleted." };
  } catch (error) {
    logError("delete", error);
    return { ok: false, formError: "The testimonial could not be deleted." };
  }
}

export async function setTestimonialStatus(input: {
  id: string;
  status: ContentStatus;
}): Promise<ActionResult<AdminTestimonial>> {
  const parsed = testimonialStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("testimonials")
      .update({ status: parsed.data.status })
      .eq("id", parsed.data.id)
      .select("*")
      .maybeSingle();
    if (error) {
      logError("status", error);
      return { ok: false, formError: "The testimonial status could not be updated." };
    }
    if (!data) return { ok: false, formError: "That testimonial no longer exists." };

    revalidateTestimonials();
    return { ok: true, data: mapTestimonial(data), message: "Testimonial status updated." };
  } catch (error) {
    logError("status", error);
    return { ok: false, formError: "The testimonial status could not be updated." };
  }
}

export async function setTestimonialFeatured(input: {
  id: string;
  featured: boolean;
}): Promise<ActionResult<AdminTestimonial>> {
  const parsed = testimonialFeaturedSchema.safeParse(input);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  await requireAdmin();
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("testimonials")
      .update({ featured: parsed.data.featured })
      .eq("id", parsed.data.id)
      .select("*")
      .maybeSingle();
    if (error) {
      logError("featured", error);
      return { ok: false, formError: "The testimonial featured state could not be updated." };
    }
    if (!data) return { ok: false, formError: "That testimonial no longer exists." };

    revalidateTestimonials();
    return { ok: true, data: mapTestimonial(data), message: "Testimonial featured state updated." };
  } catch (error) {
    logError("featured", error);
    return { ok: false, formError: "The testimonial featured state could not be updated." };
  }
}

export async function reorderTestimonials(input: string[]): Promise<ActionResult> {
  const parsed = testimonialOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, formError: "The testimonial order is invalid." };

  await requireAdmin();
  try {
    const { error } = await (
      await createServerSupabaseClient()
    ).rpc("reorder_testimonials", {
      testimonial_ids: parsed.data,
    });
    if (error) {
      logError("reorder", error);
      return { ok: false, formError: "The testimonial order could not be saved." };
    }

    revalidateTestimonials();
    return { ok: true, message: "Testimonial order saved." };
  } catch (error) {
    logError("reorder", error);
    return { ok: false, formError: "The testimonial order could not be saved." };
  }
}
