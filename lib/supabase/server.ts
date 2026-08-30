import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database.generated";

import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Creates a request-scoped authenticated client for Server Components,
 * Route Handlers, and Server Actions. Session refresh response cookies are
 * handled by the root proxy; Server Components may not mutate cookies safely.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write response cookies. The proxy owns
          // refresh persistence; this also keeps reads safe in RSC rendering.
        }
      },
    },
  });
}

/** Conventional alias for callers that import one client factory per module. */
export const createClient = createServerSupabaseClient;
