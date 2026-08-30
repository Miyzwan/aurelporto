"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import type { ActionResult } from "@/components/admin/action-result";
import { requireAdmin } from "@/lib/auth/require-admin";
import { mapAdminSiteSettings } from "@/lib/data/site";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { siteSettingsFormSchema } from "@/lib/validation/site";
import type { AdminSiteSettings, SiteSettingsMutationInput } from "@/types/content";

function fieldErrors(error: z.ZodError): Record<string, string[]> {
  return error.issues.reduce<Record<string, string[]>>((errors, issue) => {
    const field = issue.path[0];
    if (typeof field !== "string") return errors;
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

export async function updateSiteSettings(
  input: SiteSettingsMutationInput,
): Promise<ActionResult<AdminSiteSettings>> {
  const dbPayload = {
    site_name: input.siteName,
    professional_role: input.professionalRole,
    location: input.location ? input.location.trim() : null,
    service_area: input.serviceArea ? input.serviceArea.trim() : null,
    email: input.email ? input.email.trim() : null,
    phone: input.phone ? input.phone.trim() : null,
    whatsapp: input.whatsapp ? input.whatsapp.trim() : null,
    social_links: input.socialLinks,
    footer_text: input.footerText ? input.footerText.trim() : null,
    default_seo_title: input.defaultSeoTitle,
    default_seo_description: input.defaultSeoDescription,
    default_og_media_id: input.defaultOgMediaId,
    inquiry_config: input.inquiryConfig,
  };

  const parsed = siteSettingsFormSchema.safeParse(dbPayload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await requireAdmin();
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("site_settings")
      .update(parsed.data)
      .eq("id", 1)
      .select("*")
      .single();

    if (error || !data) {
      console.error("[updateSiteSettings] update failed:", error);
      return { ok: false, formError: "Could not update site settings." };
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin/site");
    revalidatePath("/contact");

    return {
      ok: true,
      data: mapAdminSiteSettings(data),
      message: "Site settings updated.",
    };
  } catch (error) {
    console.error("[updateSiteSettings] unexpected error:", error);
    return { ok: false, formError: "Could not update site settings." };
  }
}
