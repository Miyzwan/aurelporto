import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

  it("submits the form and displays the success screen on successful submission", async () => {
    const user = userEvent.setup();
    const submitAction = vi.fn().mockResolvedValue({
      ok: true,
      data: {
        successTitle: "Inquiry received",
        successBody: "Your brief has reached us safely.",
      },
    });

    render(
      <ProjectInquiryForm
        config={placeholderInquiryConfig}
        services={placeholderServices}
        submitAction={submitAction}
      />,
    );

    await user.type(screen.getByLabelText("Name"), "Alex River");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.selectOptions(screen.getByLabelText("Project type"), "Hospitality");
    await user.type(screen.getByLabelText("Project location"), "Bandung");
    await user.selectOptions(
      screen.getByLabelText("Required service"),
      placeholderServices[0]!.name,
    );
    await user.selectOptions(screen.getByLabelText("Project status"), "New Build");
    await user.selectOptions(screen.getByLabelText("Desired timeline"), "1–3 Months");
    await user.type(screen.getByLabelText("Project brief"), "A new cafe interior concept.");

    await user.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(submitAction).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Alex River",
        email: "alex@example.com",
        projectType: "Hospitality",
        projectLocation: "Bandung",
        projectBrief: "A new cafe interior concept.",
      }),
    );

    expect(await screen.findByRole("heading", { name: "Inquiry received" })).toBeInTheDocument();
    expect(screen.getByText("Your brief has reached us safely.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Send another inquiry" }));
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("displays field errors and form errors returned from action", async () => {
    const user = userEvent.setup();
    const submitAction = vi.fn().mockResolvedValue({
      ok: false,
      fieldErrors: {
        email: ["Please provide a valid email address."],
      },
      formError: "Could not submit inquiry at this time.",
    });

    render(
      <ProjectInquiryForm
        config={placeholderInquiryConfig}
        services={placeholderServices}
        submitAction={submitAction}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Send inquiry" }));

    expect(await screen.findByText("Please provide a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Could not submit inquiry at this time.")).toBeInTheDocument();
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
