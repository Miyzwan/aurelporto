import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database.generated";

import { requiredEnv, supabaseUrl } from "./env";

/**
 * Creates the privileged server-only client. Use this boundary only in the
 * validated inquiry action; ordinary admin CRUD must use the authenticated
 * server client so RLS remains the authorization layer.
 */
export function createSecretSupabaseClient() {
  return createSupabaseClient<Database>(supabaseUrl(), requiredEnv("SUPABASE_SECRET_KEY"), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/** Conventional alias for callers that import one client factory per module. */
export const createClient = createSecretSupabaseClient;
