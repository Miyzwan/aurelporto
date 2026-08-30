import type { SupabaseClient } from "@supabase/supabase-js";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AdminTestimonial, Testimonial } from "@/types/content";
import type { Database, Tables } from "@/types/database.generated";
import { testimonialRowSchema } from "@/lib/validation/testimonials";

import { parseRecord, throwDatabaseError } from "./errors";

export function mapTestimonial(row: Tables<"testimonials">): AdminTestimonial {
  const testimonial = parseRecord(testimonialRowSchema, row, row.id, "testimonials");

  return {
    id: testimonial.id,
    clientName: testimonial.client_name,
    clientRole: testimonial.client_role,
    projectName: testimonial.project_name,
    quote: testimonial.quote,
    sortOrder: testimonial.sort_order,
    featured: testimonial.featured,
    status: testimonial.status,
  };
}

async function readTestimonials(
  supabase: SupabaseClient<Database>,
  publishedOnly: boolean,
): Promise<AdminTestimonial[]> {
  let query = supabase.from("testimonials").select("*").order("sort_order").order("id");
  if (publishedOnly) query = query.eq("status", "published");

  const { data, error } = await query;
  if (error) throwDatabaseError("testimonials", error);

  return (data ?? []).map(mapTestimonial);
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  return readTestimonials(createPublicSupabaseClient(), true);
}

export async function getAdminTestimonials(): Promise<AdminTestimonial[]> {
  await requireAdmin();
  return readTestimonials(await createServerSupabaseClient(), false);
}
