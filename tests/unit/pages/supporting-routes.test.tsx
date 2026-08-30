import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";

import type { InquiryConfig, Page, ServiceSummary } from "@/types/content";
import type { PublicPageData } from "@/lib/content/public-pages";

const mocks = vi.hoisted(() => ({
  getPublicInquiryConfig: vi.fn(),
  getPublicPageData: vi.fn(),
  getPublishedExplorations: vi.fn(),
  getPublishedProcessSteps: vi.fn(),
  getPublishedServiceDetails: vi.fn(),
  getPublishedServices: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/content/public-pages", () => ({ getPublicPageData: mocks.getPublicPageData }));
vi.mock("@/lib/data/explorations", () => ({
  getPublishedExplorations: mocks.getPublishedExplorations,
}));
vi.mock("@/lib/data/process", () => ({ getPublishedProcessSteps: mocks.getPublishedProcessSteps }));
vi.mock("@/lib/data/services", () => ({
  getPublishedServiceDetails: mocks.getPublishedServiceDetails,
  getPublishedServices: mocks.getPublishedServices,
}));
vi.mock("@/lib/data/site", () => ({ getPublicInquiryConfig: mocks.getPublicInquiryConfig }));

vi.mock("@/components/public/PublicPageHeader", () => ({
  PublicPageHeader: ({ page }: { page: Page }) => <h1>{page.title}</h1>,
}));
vi.mock("@/components/public/PublicPageSectionRenderer", () => ({
  PublicPageSectionRenderer: ({ sections }: { sections: PublicPageData["sections"] }) => (
    <div data-testid="page-sections">
      {sections.map(({ section }) => section.sectionKey).join(",")}
    </div>
  ),
}));
vi.mock("@/components/public/Section", () => ({
  Section: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}));
vi.mock("@/components/services/ServiceList", () => ({
  ServiceList: ({ services }: { services: ServiceSummary[] }) => (
    <div data-testid="services">{services.map((service) => service.name).join(",")}</div>
  ),
}));
vi.mock("@/components/process/ProcessTimeline", () => ({
  ProcessTimeline: ({ steps }: { steps: Array<{ title: string }> }) => (
    <div data-testid="process">{steps.map((step) => step.title).join(",")}</div>
  ),
}));
vi.mock("@/components/explorations/ExplorationGallery", () => ({
  ExplorationGallery: ({ explorations }: { explorations: Array<{ title: string }> }) => (
    <div data-testid="explorations">{explorations.map((item) => item.title).join(",")}</div>
  ),
}));
vi.mock("@/components/contact/ProjectInquiryForm", () => ({
  ProjectInquiryForm: ({
    config,
    services,
  }: {
    config: InquiryConfig;
    services: ServiceSummary[];
  }) => (
    <div data-testid="contact-form">
      {config.successTitle}:{services.map((service) => service.name).join(",")}
    </div>
  ),
}));

import AboutPage from "@/app/(public)/about/page";
import ContactPage from "@/app/(public)/contact/page";
import ExplorationsPage from "@/app/(public)/explorations/page";
import ProcessPage from "@/app/(public)/process/page";
import ServicesPage from "@/app/(public)/services/page";

const PAGE: Page = {
  id: "00000000-0000-0000-0000-000000000001",
  slug: "supporting-page",
  title: "CMS page title",
  navLabel: "CMS label",
  seoTitle: null,
  seoDescription: null,
  ogMediaId: null,
  status: "published",
};

const PAGE_DATA: PublicPageData = {
  page: PAGE,
  sections: [
    {
      section: {
        id: "00000000-0000-0000-0000-000000000101",
        pageId: PAGE.id,
        sectionKey: "intro",
        sectionType: "rich_text",
        content: { title: "Intro", body: "CMS body" },
        settings: {},
        sortOrder: 0,
        isEnabled: true,
        status: "published",
      },
      media: [],
    },
  ],
};

const SERVICES: ServiceSummary[] = [
  {
    id: "service-1",
    slug: "service-one",
    name: "Published service",
    shortDescription: "Description",
    media: null,
    sortOrder: 0,
  },
];

const CONFIG: InquiryConfig = {
  projectTypes: ["Hospitality"],
  projectStatuses: ["Still Exploring"],
  timelineOptions: ["Flexible"],
  budgetOptions: [],
  showBudgetField: false,
  showPhoneField: true,
  successTitle: "Thank you",
  successBody: "Received.",
};

describe("supporting public routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublicPageData.mockResolvedValue(PAGE_DATA);
    mocks.getPublishedServiceDetails.mockResolvedValue(SERVICES);
    mocks.getPublishedServices.mockResolvedValue(SERVICES);
    mocks.getPublishedProcessSteps.mockResolvedValue([]);
    mocks.getPublishedExplorations.mockResolvedValue([]);
    mocks.getPublicInquiryConfig.mockResolvedValue(CONFIG);
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  it("uses CMS page sections and published services", async () => {
    render(await ServicesPage());

    expect(mocks.getPublicPageData).toHaveBeenCalledWith("services");
    expect(mocks.getPublishedServiceDetails).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: PAGE.title })).toBeInTheDocument();
    expect(screen.getByTestId("page-sections")).toHaveTextContent("intro");
    expect(screen.getByTestId("services")).toHaveTextContent("Published service");
  });

  it("uses published process steps and explorations only", async () => {
    render(await ProcessPage());
    expect(mocks.getPublicPageData).toHaveBeenCalledWith("process");
    expect(mocks.getPublishedProcessSteps).toHaveBeenCalledOnce();

    render(await ExplorationsPage());
    expect(mocks.getPublicPageData).toHaveBeenCalledWith("explorations");
    expect(mocks.getPublishedExplorations).toHaveBeenCalledOnce();
  });

  it("renders About from generic page sections without placeholder copy", async () => {
    render(await AboutPage());

    expect(mocks.getPublicPageData).toHaveBeenCalledWith("about");
    expect(screen.getByRole("heading", { name: PAGE.title })).toBeInTheDocument();
    expect(screen.getByTestId("page-sections")).toHaveTextContent("intro");
    expect(
      screen.queryByText("Gabrielle Aurelia Sulistya is an Interior Design student"),
    ).not.toBeInTheDocument();
  });

  it("loads inquiry config and published services for Contact", async () => {
    render(await ContactPage());

    expect(mocks.getPublicPageData).toHaveBeenCalledWith("contact");
    expect(mocks.getPublicInquiryConfig).toHaveBeenCalledOnce();
    expect(mocks.getPublishedServices).toHaveBeenCalledOnce();
    expect(screen.getByTestId("contact-form")).toHaveTextContent("Thank you:Published service");
  });

  it("returns notFound when a supporting page is unpublished", async () => {
    mocks.getPublicPageData.mockResolvedValue(null);

    await expect(AboutPage()).rejects.toThrow("NEXT_NOT_FOUND");
    expect(mocks.notFound).toHaveBeenCalledOnce();
  });
});
