"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import type { ActionResult } from "@/components/admin/action-result";
import { requireAdmin } from "@/lib/auth/require-admin";
import { mapInquiry } from "@/lib/data/inquiries";
import { getPublicInquiryConfig } from "@/lib/data/site";
import { createSecretSupabaseClient } from "@/lib/supabase/secret";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { uuidSchema, inquiryStatusSchema } from "@/lib/validation/common";
import {
  inquiryFormSchema,
  publicInquiryInputSchema,
  type PublicInquiryInput,
} from "@/lib/validation/inquiries";
import type { InquiryRecord } from "@/types/content";

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = issue.path[0];
    if (typeof field !== "string") return errors;
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

/**
 * Validates and submits a public project inquiry.
 *
 * Uses the privileged server-only Supabase secret client to insert into the
 * `inquiries` table since anonymous direct API insertion is blocked by RLS.
 * Rejects honeypot bot submissions immediately.
 */
export async function submitInquiry(
  input: PublicInquiryInput,
): Promise<ActionResult<{ successTitle?: string; successBody?: string }>> {
  // 1. Bot check: honeypot field must remain empty
  if (input?.company && input.company.trim().length > 0) {
    return {
      ok: false,
      formError: "Your submission could not be processed. Please try again.",
    };
  }

  // 2. Validate input schema
  const parsedInput = publicInquiryInputSchema.safeParse(input);
  if (!parsedInput.success) {
    return { ok: false, fieldErrors: fieldErrors(parsedInput.error) };
  }

  const data = parsedInput.data;

  // 3. Fetch active inquiry configuration from site settings
  let config;
  try {
    config = await getPublicInquiryConfig();
  } catch (configError) {
    console.error("[inquiry submit] failed to fetch inquiry config:", configError);
    config = {
      projectTypes: [],
      projectStatuses: [],
      timelineOptions: [],
      budgetOptions: [],
      showBudgetField: false,
      showPhoneField: true,
      successTitle: "Thank you",
      successBody: "Your project inquiry has been received.",
    };
  }

  const errors: Record<string, string[]> = {};

  // Parse and validate areaSqm if provided
  let parsedAreaSqm: number | null = null;
  if (data.areaSqm !== undefined && data.areaSqm !== null && data.areaSqm !== "") {
    const num = typeof data.areaSqm === "number" ? data.areaSqm : Number(data.areaSqm);
    if (Number.isNaN(num) || num < 0) {
      errors.areaSqm = ["Please enter a valid positive area."];
    } else {
      parsedAreaSqm = num;
    }
  }

  // Sanitize conditional fields against config
  const normalizedPhone =
    config.showPhoneField && data.phone && data.phone.trim().length > 0 ? data.phone.trim() : null;

  const normalizedBudget =
    config.showBudgetField &&
    config.budgetOptions.length > 0 &&
    data.budgetRange &&
    data.budgetRange.trim().length > 0
      ? data.budgetRange.trim()
      : null;

  if (Object.keys(errors).length > 0) {
    return { ok: false, fieldErrors: errors };
  }

  const dbPayload = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: normalizedPhone,
    project_type: data.projectType.trim(),
    project_location: data.projectLocation.trim(),
    area_sqm: parsedAreaSqm,
    required_service: data.requiredService.trim(),
    project_status: data.projectStatus.trim(),
    desired_timeline: data.desiredTimeline.trim(),
    budget_range: normalizedBudget,
    project_brief: data.projectBrief.trim(),
    referral_source: data.referralSource?.trim() || null,
  };

  const formResult = inquiryFormSchema.safeParse(dbPayload);
  if (!formResult.success) {
    return { ok: false, fieldErrors: fieldErrors(formResult.error) };
  }

  // 4. Insert using the privileged secret client (never accessible to the browser)
  try {
    const supabase = createSecretSupabaseClient();
    const { error: insertError } = await supabase.from("inquiries").insert({
      ...formResult.data,
      status: "new",
    });

    if (insertError) {
      console.error("[inquiry submit] database insertion error:", insertError);
      return {
        ok: false,
        formError: "We could not submit your inquiry at this moment. Please try again later.",
      };
    }

    revalidatePath("/admin/inquiries");

    return {
      ok: true,
      data: {
        successTitle: config.successTitle || "Thank you",
        successBody: config.successBody || "Your project inquiry has been received.",
      },
      message: config.successBody || "Your project inquiry has been received.",
    };
  } catch (error) {
    console.error("[inquiry submit] unexpected failure:", error);
    return {
      ok: false,
      formError: "We could not submit your inquiry at this moment. Please try again later.",
    };
  }
}

const updateInquirySchema = z
  .object({
    id: uuidSchema,
    status: inquiryStatusSchema,
    adminNotes: z.string().max(10000).optional().nullable(),
  })
  .strict();

/**
 * Updates status and admin notes for a received inquiry.
 * Requires authenticated admin identity under RLS.
 */
export async function updateInquiry(input: {
  id: string;
  status: InquiryRecord["status"];
  adminNotes?: string | null;
}): Promise<ActionResult<InquiryRecord>> {
  const parsed = updateInquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("inquiries")
      .update({
        status: parsed.data.status,
        admin_notes: parsed.data.adminNotes ? parsed.data.adminNotes.trim() : null,
      })
      .eq("id", parsed.data.id)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[updateInquiry] update failed:", error);
      return { ok: false, formError: "Could not update inquiry." };
    }

    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${parsed.data.id}`);

    return {
      ok: true,
      data: mapInquiry(data),
      message: "Inquiry updated.",
    };
  } catch (error) {
    console.error("[updateInquiry] unexpected error:", error);
    return { ok: false, formError: "Could not update inquiry." };
  }
}
