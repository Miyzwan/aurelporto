import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database.generated";

import { supabasePublishableKey, supabaseUrl } from "./env";

const browserClient = createBrowserClient<Database>(supabaseUrl(), supabasePublishableKey());

/**
 * Returns the singleton browser client used by client components and browser
 * auth flows. The SSR package persists the session in cookies shared with the
 * server client.
 */
export function createBrowserSupabaseClient() {
  return browserClient;
}

/** Conventional alias for callers that import one client factory per module. */
export const createClient = createBrowserSupabaseClient;
