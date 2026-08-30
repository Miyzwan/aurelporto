import { requireAdmin } from "@/lib/auth/require-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { InquiryRecord } from "@/types/content";
import type { Tables } from "@/types/database.generated";
import { inquiryRowSchema } from "@/lib/validation/inquiries";

import { parseRecord, throwDatabaseError } from "./errors";

function mapInquiry(row: Tables<"inquiries">): InquiryRecord {
  const inquiry = parseRecord(inquiryRowSchema, row, row.id, "inquiries");

  return {
    id: inquiry.id,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    projectType: inquiry.project_type,
    projectLocation: inquiry.project_location,
    areaSqm: inquiry.area_sqm,
    requiredService: inquiry.required_service,
    projectStatus: inquiry.project_status,
    desiredTimeline: inquiry.desired_timeline,
    budgetRange: inquiry.budget_range,
    projectBrief: inquiry.project_brief,
    referralSource: inquiry.referral_source,
    status: inquiry.status,
    adminNotes: inquiry.admin_notes,
    submittedAt: inquiry.submitted_at,
    updatedAt: inquiry.updated_at,
  };
}

export async function getAdminInquiries(): Promise<InquiryRecord[]> {
  await requireAdmin();
  const { data, error } = await (
    await createServerSupabaseClient()
  )
    .from("inquiries")
    .select("*")
    .order("submitted_at", { ascending: false })
    .order("id");
  if (error) throwDatabaseError("inquiries", error);

  return (data ?? []).map(mapInquiry);
}

export async function getAdminInquiryById(inquiryId: string): Promise<InquiryRecord | null> {
  await requireAdmin();
  const { data, error } = await (
    await createServerSupabaseClient()
  )
    .from("inquiries")
    .select("*")
    .eq("id", inquiryId)
    .maybeSingle();
  if (error) throwDatabaseError("inquiry", error);

  return data ? mapInquiry(data) : null;
}
