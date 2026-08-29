import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MobileMenu } from "@/components/public/MobileMenu";
import type { NavigationItem } from "@/types/content";

const pathname = vi.hoisted(() => ({ current: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => pathname.current,
}));

const items: NavigationItem[] = [
  {
    id: "1",
    label: "Projects",
    href: "/projects",
    placement: "header",
    sortOrder: 0,
    isVisible: true,
    targetBlank: false,
  },
  {
    id: "2",
    label: "About",
    href: "/about",
    placement: "header",
    sortOrder: 1,
    isVisible: true,
    targetBlank: false,
  },
];

function renderMenu(cta: { label: string; href: string } | null = null) {
  return render(<MobileMenu items={items} cta={cta} siteName="Studio" />);
}

describe("MobileMenu", () => {
  beforeEach(() => {
    pathname.current = "/";
  });

  it("keeps the panel hidden until the trigger is pressed", () => {
    renderMenu();
    expect(screen.getByRole("dialog", { hidden: true })).not.toBeVisible();
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the panel and moves focus into it", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(screen.getByRole("button", { name: "Menu" }));

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeVisible();
    await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
  });

  it("traps Tab inside the panel", async () => {
    const user = userEvent.setup();
    renderMenu({ label: "Contact", href: "/contact" });

    await user.click(screen.getByRole("button", { name: "Menu" }));
    const dialog = screen.getByRole("dialog");

    // Walk past the last focusable element; focus must wrap, not escape.
    for (let i = 0; i < 8; i += 1) {
      await user.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });

  it("closes on Escape and restores focus to the trigger", async () => {
    const user = userEvent.setup();
    renderMenu();
    const trigger = screen.getByRole("button", { name: "Menu" });

    await user.click(trigger);
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.getByRole("dialog", { hidden: true })).not.toBeVisible());
    expect(screen.getByRole("button", { name: "Menu" })).toHaveFocus();
  });

  it("closes when the route changes", async () => {
    const user = userEvent.setup();
    const { rerender } = renderMenu();

    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("dialog")).toBeVisible();

    pathname.current = "/projects";
    rerender(<MobileMenu items={items} cta={null} siteName="Studio" />);

    await waitFor(() => expect(screen.getByRole("dialog", { hidden: true })).not.toBeVisible());
  });

  it("omits the call to action when no slot is supplied", async () => {
    const user = userEvent.setup();
    renderMenu(null);

    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.queryByRole("link", { name: "Contact" })).not.toBeInTheDocument();
  });
});
