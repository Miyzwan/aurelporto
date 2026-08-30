"use server";

import { redirect } from "next/navigation";

import type { LoginFormState } from "@/components/auth/LoginForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const DEFAULT_ADMIN_PATH = "/admin";
const REDIRECT_ORIGIN = "http://aurelporto.invalid";

function formString(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Accept only same-origin paths supplied by the admin proxy. This prevents a
 * crafted `next` field from turning login into an open redirect.
 */
function safeAdminRedirectPath(value: string): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return DEFAULT_ADMIN_PATH;
  }

  try {
    const target = new URL(value, REDIRECT_ORIGIN);

    if (target.origin !== REDIRECT_ORIGIN) {
      return DEFAULT_ADMIN_PATH;
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return DEFAULT_ADMIN_PATH;
  }
}

export async function loginAction(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = formString(formData, "email").trim();
  const password = formString(formData, "password");

  if (!email || !password) {
    return { status: "error" };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { status: "error" };
    }
  } catch {
    // Keep provider, network, and configuration details out of the login UI.
    return { status: "error" };
  }

  redirect(safeAdminRedirectPath(formString(formData, "next")));
}
