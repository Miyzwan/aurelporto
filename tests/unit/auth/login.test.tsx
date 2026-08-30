import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  GENERIC_LOGIN_ERROR,
  LoginForm,
  type LoginAction,
  type LoginFormState,
} from "@/components/auth/LoginForm";

describe("LoginForm", () => {
  it("renders labelled login fields with password-manager autocomplete", () => {
    render(<LoginForm nextPath="/admin/projects" />);

    expect(screen.getByLabelText("Email address")).toHaveAttribute("autocomplete", "username");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");
    expect(screen.getByDisplayValue("/admin/projects")).toHaveAttribute("name", "next");
    expect(screen.queryByRole("link", { name: /sign up|register/i })).not.toBeInTheDocument();
  });

  it("shows a generic credential error without exposing action details", async () => {
    const action = vi.fn<LoginAction>(async () => ({ status: "error" }));
    const user = userEvent.setup();
    render(<LoginForm action={action} />);

    await user.type(screen.getByLabelText("Email address"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "not-the-password");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(GENERIC_LOGIN_ERROR);
    expect(screen.queryByText(/supabase|invalid api key|postgres/i)).not.toBeInTheDocument();
  });

  it("disables submission and announces the pending state", async () => {
    let resolveAction: (state: LoginFormState) => void = () => undefined;
    const action = vi.fn<LoginAction>(
      () => new Promise<LoginFormState>((resolve) => (resolveAction = resolve)),
    );
    const user = userEvent.setup();
    render(<LoginForm action={action} />);

    await user.type(screen.getByLabelText("Email address"), "admin@example.com");
    await user.type(screen.getByLabelText("Password"), "not-the-password");
    const submitPromise = user.click(screen.getByRole("button", { name: "Sign in" }));

    const pendingButton = await screen.findByRole("button", { name: "Signing in..." });
    expect(pendingButton).toBeDisabled();
    expect(pendingButton.closest("form")).toHaveAttribute("aria-busy", "true");

    resolveAction({ status: "idle" });
    await submitPromise;
    await waitFor(() => expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled());
  });
});
