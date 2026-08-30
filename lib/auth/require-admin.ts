import "server-only";

import { notFound, redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface RequiredAdmin {
  userId: string;
  displayName: string | null;
}

/**
 * Verifies the request identity and its database-backed admin role. The
 * profile query intentionally uses the authenticated client so RLS remains
 * part of the authorization boundary.
 */
export async function requireAdmin(): Promise<RequiredAdmin> {
  const supabase = await createServerSupabaseClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (claimsError || !userId) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || profile?.role !== "admin" || profile.id !== userId) {
    notFound();
  }

  return {
    userId,
    displayName: profile.display_name,
  };
}
