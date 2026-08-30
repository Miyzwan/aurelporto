import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DashboardScreen,
  NavigationScreen,
  PageDetailScreen,
  PagesScreen,
  SectionEditor,
  SiteSettingsScreen,
} from "@/components/admin";
import type {
  AdminMediaAsset,
  AdminSiteSettings,
  NavigationItem,
  Page,
  PageSection,
} from "@/types/content";

const sampleMedia: AdminMediaAsset = {
  id: "media-1",
  bucket: "portfolio-public",
  storagePath: "hero.jpg",
  mediaType: "image",
  altText: "Studio hero image",
  caption: null,
  photographer: null,
  width: 1920,
  height: 1080,
  posterPath: null,
  mimeType: "image/jpeg",
  isArchived: false,
  fileSizeBytes: 500000,
  createdAt: "2026-08-30T10:00:00.000Z",
  updatedAt: "2026-08-30T10:00:00.000Z",
};

const sampleSettings: AdminSiteSettings = {
  siteName: "Gabrielle Aurelia",
  professionalRole: "Interior Designer",
  location: "Jakarta, Indonesia",
  serviceArea: "Jakarta · Bandung · Bali",
  email: "contact@example.com",
  phone: "+62 812 3456 7890",
  whatsapp: "+62 812 3456 7890",
  socialLinks: [{ label: "Instagram", href: "https://instagram.com/aurel" }],
  footerText: "© 2026 Gabrielle Aurelia.",
  defaultSeoTitle: "Gabrielle Aurelia Studio",
  defaultSeoDescription: "Interior design studio.",
  defaultOgMediaId: null,
  inquiryConfig: {
    projectTypes: ["Hospitality", "Residential"],
    projectStatuses: ["Planning", "Execution"],
    timelineOptions: ["1–3 Months", "3–6 Months"],
    budgetOptions: ["$10k - $25k", "$25k - $50k"],
    showBudgetField: true,
    showPhoneField: true,
    successTitle: "Inquiry received",
    successBody: "We will get back to you shortly.",
  },
};

const sampleNavItem: NavigationItem = {
  id: "nav-1",
  label: "Projects",
  href: "/projects",
  placement: "header",
  sortOrder: 0,
  isVisible: true,
  targetBlank: false,
};

const samplePage: Page = {
  id: "page-1",
  slug: "about",
  title: "About the Studio",
  navLabel: "About",
  seoTitle: "About Gabrielle",
  seoDescription: "About the studio",
  ogMediaId: null,
  status: "published",
};

const sampleSection: PageSection = {
  id: "section-1",
  pageId: "page-1",
  sectionKey: "intro",
  sectionType: "rich_text",
  content: { title: "Our Ethos", body: "We believe in spaces with intention." },
  settings: {},
  sortOrder: 0,
  isEnabled: true,
  status: "published",
};

describe("admin editors and screens", () => {
  it("renders DashboardScreen with quick navigation cards", () => {
    render(<DashboardScreen stats={{ pagesCount: 6, inquiriesNewCount: 2 }} />);

    expect(screen.getByRole("heading", { name: "Admin Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Site Settings")).toBeInTheDocument();
    expect(screen.getByText("Pages & Sections")).toBeInTheDocument();
    expect(screen.getByText("2 new")).toBeInTheDocument();
  });

  it("edits site settings and inquiry configuration", async () => {
    const user = userEvent.setup();
    const updateAction = vi.fn().mockResolvedValue({
      ok: true,
      data: sampleSettings,
      message: "Site settings saved.",
    });

    render(
      <SiteSettingsScreen
        initialSettings={sampleSettings}
        mediaAssets={[sampleMedia]}
        updateAction={updateAction}
      />,
    );

    const siteNameInput = screen.getByLabelText("Site Name");
    expect(siteNameInput).toHaveValue("Gabrielle Aurelia");

    await user.clear(siteNameInput);
    await user.type(siteNameInput, "Studio Aurelia");

    const saveButton = screen.getByRole("button", { name: "Save changes" });
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);
    expect(updateAction).toHaveBeenCalledWith(
      expect.objectContaining({ siteName: "Studio Aurelia" }),
    );
  });

  it("supports navigation CRUD workflows", async () => {
    const user = userEvent.setup();
    const createAction = vi.fn().mockResolvedValue({
      ok: true,
      data: {
        id: "nav-2",
        label: "Journal",
        href: "/journal",
        placement: "header",
        sortOrder: 1,
        isVisible: true,
        targetBlank: false,
      },
      message: "Navigation item created.",
    });

    render(
      <NavigationScreen
        initialItems={[sampleNavItem]}
        createAction={createAction}
        updateAction={vi.fn()}
        deleteAction={vi.fn()}
        reorderAction={vi.fn()}
      />,
    );

    expect(screen.getByText("Projects")).toBeInTheDocument();

    const addButtons = screen.getAllByRole("button", { name: "+ Add link" });
    await user.click(addButtons[0]!);

    await user.type(screen.getByLabelText("Link Label"), "Journal");
    await user.type(
      screen.getByLabelText("Destination URL (Internal path or external link)"),
      "/journal",
    );

    await user.click(screen.getByRole("button", { name: "Create link" }));
    expect(createAction).toHaveBeenCalledWith(
      expect.objectContaining({ label: "Journal", href: "/journal" }),
    );
  });

  it("renders page list in PagesScreen and filters", async () => {
    const user = userEvent.setup();
    render(<PagesScreen initialPages={[samplePage]} />);

    expect(screen.getByText("About the Studio")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit Sections" })).toHaveAttribute(
      "href",
      "/admin/pages/about",
    );

    const searchInput = screen.getByPlaceholderText("Filter pages by title or slug...");
    await user.type(searchInput, "contact");
    expect(screen.getByText("No pages match your filter.")).toBeInTheDocument();
  });

  it("supports editing page metadata and sections in PageDetailScreen", async () => {
    const user = userEvent.setup();
    const updatePageAction = vi.fn().mockResolvedValue({
      ok: true,
      data: samplePage,
      message: "Page metadata saved.",
    });
    const toggleSectionAction = vi.fn().mockResolvedValue({
      ok: true,
      data: { ...sampleSection, isEnabled: false },
      message: "Section disabled.",
    });

    render(
      <PageDetailScreen
        page={samplePage}
        initialSections={[sampleSection]}
        mediaAssets={[sampleMedia]}
        updatePageAction={updatePageAction}
        createSectionAction={vi.fn()}
        updateSectionAction={vi.fn()}
        toggleSectionAction={toggleSectionAction}
        deleteSectionAction={vi.fn()}
        reorderSectionsAction={vi.fn()}
      />,
    );

    expect(screen.getByRole("heading", { name: "About the Studio" })).toBeInTheDocument();
    expect(screen.getByText("intro")).toBeInTheDocument();

    // Toggle section
    await user.click(screen.getByRole("button", { name: "Enabled" }));
    expect(toggleSectionAction).toHaveBeenCalledWith("section-1", false);
  });

  it("SectionEditor allows creating and modifying rich content without raw JSON", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue({
      ok: true,
      data: sampleSection,
      message: "Section saved.",
    });

    render(
      <SectionEditor
        pageId="page-1"
        section={null}
        mediaAssets={[sampleMedia]}
        isOpen={true}
        onClose={vi.fn()}
        onSave={onSave}
      />,
    );

    expect(screen.getByText("Add New Section")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Section Key"), "intro");
    await user.type(screen.getByLabelText("Title"), "About our design approach");
    await user.type(
      screen.getByLabelText("Body text (Markdown supported)"),
      "We design thoughtful residential spaces.",
    );

    await user.click(screen.getByRole("button", { name: "Create section" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        pageId: "page-1",
        sectionKey: "intro",
        sectionType: "rich_text",
        content: expect.objectContaining({
          title: "About our design approach",
          body: "We design thoughtful residential spaces.",
        }),
      }),
    );
  });
});
