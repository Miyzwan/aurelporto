import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import type { NavigationItem, SiteSettings } from "@/types/content";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

const emptySettings: SiteSettings = {
  siteName: "Gabrielle Aurelia Sulistya",
  professionalRole: "Interior Designer & Spatial Visualizer",
  location: null,
  serviceArea: null,
  email: null,
  phone: null,
  whatsapp: null,
  socialLinks: [],
  footerText: null,
};

const navigation: NavigationItem[] = [
  {
    id: "1",
    label: "Projects",
    href: "/projects",
    placement: "header",
    sortOrder: 1,
    isVisible: true,
    targetBlank: false,
  },
  {
    id: "2",
    label: "About",
    href: "/about",
    placement: "header",
    sortOrder: 0,
    isVisible: true,
    targetBlank: false,
  },
  {
    id: "3",
    label: "Hidden",
    href: "/hidden",
    placement: "header",
    sortOrder: 2,
    isVisible: false,
    targetBlank: false,
  },
];

describe("Header", () => {
  it("renders visible items in sort order and drops hidden ones", () => {
    render(<Header siteSettings={emptySettings} navigation={navigation} />);

    const nav = screen.getByRole("navigation", { name: "Main" });
    const labels = Array.from(nav.querySelectorAll("a")).map((a) => a.textContent);
    expect(labels).toEqual(["About", "Projects"]);
    expect(screen.queryByRole("link", { name: "Hidden" })).not.toBeInTheDocument();
  });

  it("renders the call-to-action slot only when one is provided", () => {
    const { rerender } = render(<Header siteSettings={emptySettings} navigation={[]} />);
    expect(screen.queryByRole("link", { name: "Contact" })).not.toBeInTheDocument();

    rerender(
      <Header
        siteSettings={emptySettings}
        navigation={[]}
        cta={{ label: "Contact", href: "/contact" }}
      />,
    );
    expect(screen.getAllByRole("link", { name: "Contact" }).length).toBeGreaterThan(0);
  });
});

describe("Footer", () => {
  it("omits contact and social blocks when the data is empty", () => {
    render(<Footer siteSettings={emptySettings} navigation={[]} />);

    expect(screen.queryByRole("heading", { name: "Contact" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Elsewhere" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "Footer" })).not.toBeInTheDocument();
    expect(screen.getByText("Gabrielle Aurelia Sulistya")).toBeInTheDocument();
  });

  it("renders contact channels once they are confirmed", () => {
    render(
      <Footer
        siteSettings={{
          ...emptySettings,
          email: "hello@example.com",
          whatsapp: "+62 812 0000 0000",
          socialLinks: [{ label: "LinkedIn", href: "https://example.com" }],
        }}
        navigation={[]}
      />,
    );

    expect(screen.getByRole("link", { name: "hello@example.com" })).toHaveAttribute(
      "href",
      "mailto:hello@example.com",
    );
    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      "https://wa.me/6281200000000",
    );
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute("rel", "noreferrer noopener");
  });
});
