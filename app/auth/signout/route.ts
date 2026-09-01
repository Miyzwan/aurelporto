import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Signing out mutates session state, so it is POST-only on purpose. As a GET
 * route it was reachable by anything that follows links without a click —
 * Next.js prefetches in-viewport links in production, so merely rendering the
 * admin shell signed the admin out in the background.
 */
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  // 303 so the browser follows the redirect with GET instead of replaying POST.
  return NextResponse.redirect(new URL("/auth/login", request.url), 303);
}
