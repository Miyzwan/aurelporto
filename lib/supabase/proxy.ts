import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database.generated";

import { supabasePublishableKey, supabaseUrl } from "./env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

const ADMIN_PATH_PREFIX = "/admin";
const LOGIN_PATH = "/auth/login";

function isAdminPath(pathname: string): boolean {
  return pathname === ADMIN_PATH_PREFIX || pathname.startsWith(`${ADMIN_PATH_PREFIX}/`);
}

function createLoginRedirect(request: NextRequest): URL {
  const loginUrl = new URL(LOGIN_PATH, request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  loginUrl.searchParams.set("next", nextPath);
  return loginUrl;
}

/**
 * Refreshes the Supabase session before rendering a request. This function is
 * intentionally limited to session continuity; server-side admin guards make
 * the final authorization decision in the route tree.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  const cookiesToForward: CookieToSet[] = [];
  const headersToForward = new Map<string, string>();

  const supabase = createServerClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach((cookie) => {
          request.cookies.set(cookie.name, cookie.value);
          cookiesToForward.push(cookie);
        });

        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
          headersToForward.set(key, value);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims && isAdminPath(request.nextUrl.pathname)) {
    const redirectResponse = NextResponse.redirect(createLoginRedirect(request));

    cookiesToForward.forEach(({ name, value, options }) => {
      redirectResponse.cookies.set(name, value, options);
    });

    headersToForward.forEach((value, key) => {
      redirectResponse.headers.set(key, value);
    });

    return redirectResponse;
  }

  return response;
}
