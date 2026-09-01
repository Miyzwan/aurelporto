import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AdminShell } from "@/components/admin/AdminShell";
import { adminNavigation } from "@/components/admin/routes";

const pathname = vi.hoisted(() => ({ current: "/admin/projects/123" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

describe("AdminShell", () => {
  it("renders every top-level admin destination and marks child routes active", () => {
    render(
      <AdminShell profile={{ displayName: "Aurel Porto" }}>
        <p>Project editor</p>
      </AdminShell>,
    );

    for (const item of adminNavigation) {
      expect(screen.getByRole("link", { name: item.label })).toHaveAttribute("href", item.href);
    }

    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
    expect(screen.getByText("Project editor")).toBeInTheDocument();
    expect(screen.getAllByText("Aurel Porto")).not.toHaveLength(0);
  });

  it("opens and closes the mobile navigation without hover", async () => {
    const user = userEvent.setup();
    render(
      <AdminShell>
        <p>Content</p>
      </AdminShell>,
    );

    const menuButton = screen.getByRole("button", { name: "Open admin navigation menu" });
    await user.click(menuButton);
    expect(
      screen.getByRole("button", { name: "Close admin navigation drawer" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close admin navigation drawer" }));
    expect(screen.getByRole("button", { name: "Open admin navigation menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("renders the logout control through the provided slot", () => {
    render(
      <AdminShell logoutSlot={<button type="button">Log out</button>}>
        <p>Content</p>
      </AdminShell>,
    );

    expect(screen.getByRole("button", { name: "Log out" })).toBeInTheDocument();
  });

  it("signs out through a POST form so no prefetch or preload can end the session", () => {
    // Regression: the default slot used to be <Link href="/auth/signout">. Next.js
    // prefetches in-viewport links in production, so simply opening an admin page
    // issued GET /auth/signout and destroyed the session mid-visit.
    render(
      <AdminShell profile={{ displayName: "Aurel Porto" }}>
        <p>Content</p>
      </AdminShell>,
    );

    expect(screen.queryByRole("link", { name: "Sign out" })).not.toBeInTheDocument();

    const signOut = screen.getByRole("button", { name: "Sign out" });
    expect(signOut).toHaveAttribute("type", "submit");

    const form = signOut.closest("form");
    expect(form).not.toBeNull();
    expect(form).toHaveAttribute("method", "post");
    expect(form).toHaveAttribute("action", "/auth/signout");
  });
});
