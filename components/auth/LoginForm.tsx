"use client";

import { useActionState } from "react";

import { cn } from "@/lib/utils/cn";

export type LoginFormState = {
  status: "idle" | "error";
};

export type LoginAction = (
  previousState: LoginFormState,
  formData: FormData,
) => LoginFormState | Promise<LoginFormState>;

export const GENERIC_LOGIN_ERROR = "The email or password is incorrect. Please try again.";

const initialState: LoginFormState = { status: "idle" };

/**
 * INT-003 supplies the server action that calls Supabase Auth and redirects
 * on success. Until then, keep the UI safe and deterministic without
 * exposing an implementation or provider error to the visitor.
 */
const unconfiguredLoginAction: LoginAction = async () => ({ status: "error" });

const CONTROL =
  "border-line-strong focus:border-ink focus:ring-focus mt-2 min-h-12 w-full border bg-surface px-4 py-3 text-base outline-none transition-colors duration-(--duration-quick) placeholder:text-foreground-subtle";

interface LoginFormProps {
  action?: LoginAction;
  nextPath?: string;
}

function FieldError({ hasError }: { hasError: boolean }) {
  return hasError ? (
    <p id="login-error" role="alert" aria-live="polite" className="type-spec text-critical mt-4">
      {GENERIC_LOGIN_ERROR}
    </p>
  ) : null;
}

export function LoginForm({ action, nextPath }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(
    action ?? unconfiguredLoginAction,
    initialState,
  );
  const hasError = state.status === "error";

  return (
    <form action={formAction} aria-busy={pending} className="flex flex-col" noValidate>
      <div className="flex flex-col">
        <label htmlFor="login-email" className="type-meta text-foreground-muted">
          Email address
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? "login-error" : undefined}
          className={cn(CONTROL, hasError && "border-critical")}
        />
      </div>

      <div className="mt-6 flex flex-col">
        <label htmlFor="login-password" className="type-meta text-foreground-muted">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? "login-error" : undefined}
          className={cn(CONTROL, hasError && "border-critical")}
        />
      </div>

      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      <FieldError hasError={hasError} />

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "bg-ink text-warm-white hover:bg-foreground-muted mt-8 inline-flex min-h-12 items-center justify-center px-6 py-3 transition-[background-color,transform,opacity] duration-(--duration-quick) active:translate-y-px",
          pending && "cursor-wait opacity-65",
        )}
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
