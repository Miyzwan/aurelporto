import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.generated";

import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Creates an unauthenticated server client for public content reads. Auth
 * persistence is disabled so this client never depends on a visitor session.
 */
export function createPublicSupabaseClient() {
  return createSupabaseClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/** Conventional alias for callers that import one client factory per module. */
export const createClient = createPublicSupabaseClient;
