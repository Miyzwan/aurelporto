import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectInquiryForm } from "@/components/contact/ProjectInquiryForm";
import { ExplorationGallery } from "@/components/explorations/ExplorationGallery";
import { ProcessTimeline } from "@/components/process/ProcessTimeline";
import { ServiceList } from "@/components/services/ServiceList";
import { placeholderServices } from "@/lib/content/placeholder-home";
import {
  placeholderInquiryConfig,
  placeholderServiceDetails,
} from "@/lib/content/placeholder-pages";

describe("ProjectInquiryForm", () => {
  it("labels every control", () => {
    const { container } = render(
      <ProjectInquiryForm config={placeholderInquiryConfig} services={placeholderServices} />,
    );

    const controls = container.querySelectorAll("input, select, textarea");
    expect(controls.length).toBeGreaterThan(0);

    for (const control of controls) {
      const id = control.getAttribute("id");
      expect(id, `control ${control.getAttribute("name")} has no id`).toBeTruthy();
      expect(container.querySelector(`label[for="${id}"]`), `no label for ${id}`).not.toBeNull();
    }
  });

  it("carries every field the inquiries table requires", () => {
    const { container } = render(
      <ProjectInquiryForm config={placeholderInquiryConfig} services={placeholderServices} />,
    );

    const names = Array.from(container.querySelectorAll("[name]")).map((el) =>
      el.getAttribute("name"),
    );
    expect(names).toEqual(
      expect.arrayContaining([
        "name",
        "email",
        "phone",
        "projectType",
        "projectLocation",
        "areaSqm",
        "requiredService",
        "projectStatus",
        "desiredTimeline",
        "projectBrief",
        "referralSource",
      ]),
    );
  });

  it("uses input types that bring up the right mobile keyboard", () => {
    render(<ProjectInquiryForm config={placeholderInquiryConfig} services={placeholderServices} />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/Phone/)).toHaveAttribute("type", "tel");
  });

  it("hides the honeypot from sight, assistive tech, and the tab order", () => {
    const { container } = render(
      <ProjectInquiryForm config={placeholderInquiryConfig} services={placeholderServices} />,
    );

    const honeypot = container.querySelector('[name="company"]');
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot?.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("drops configurable fields when the config turns them off", () => {
    render(
      <ProjectInquiryForm
        config={{ ...placeholderInquiryConfig, showPhoneField: false }}
        services={placeholderServices}
      />,
    );
    expect(screen.queryByLabelText(/Phone/)).not.toBeInTheDocument();
  });

  it("omits the budget field when no options are configured", () => {
    render(
      <ProjectInquiryForm
        config={{ ...placeholderInquiryConfig, showBudgetField: true, budgetOptions: [] }}
        services={placeholderServices}
      />,
    );
    expect(screen.queryByLabelText(/Budget/)).not.toBeInTheDocument();
  });
});

describe("supporting pages with zero content", () => {
  it("ServiceList shows a message rather than an empty rule", () => {
    render(<ServiceList services={[]} />);
    expect(screen.getByText("Details are being prepared.")).toBeInTheDocument();
  });

  it("ProcessTimeline shows a message rather than an empty list", () => {
    render(<ProcessTimeline steps={[]} />);
    expect(screen.getByText("The process is being written up.")).toBeInTheDocument();
  });

  it("ExplorationGallery shows an intentional empty state", () => {
    render(<ExplorationGallery explorations={[]} />);
    expect(screen.getByText(/will be published here/)).toBeInTheDocument();
  });

  it("ServiceList renders a service that has no media or detail lists", () => {
    render(<ServiceList services={placeholderServiceDetails} />);
    expect(screen.getAllByRole("article")).toHaveLength(placeholderServiceDetails.length);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
