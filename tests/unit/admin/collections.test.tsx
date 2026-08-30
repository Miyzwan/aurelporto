import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  ExplorationsCollectionScreen,
  InquiryDetailScreen,
  InquiriesCollectionScreen,
  MediaCollectionScreen,
  ProcessCollectionScreen,
  ServicesCollectionScreen,
  TestimonialsCollectionScreen,
} from "@/components/admin/CollectionScreens";
import type {
  AdminExplorationSummary,
  AdminMediaAsset,
  AdminProcessStep,
  AdminServiceDetail,
  AdminTestimonial,
  ExplorationMediaItem,
  InquiryRecord,
} from "@/types/content";

const media: AdminMediaAsset = {
  id: "media-1",
  bucket: "portfolio-public",
  storagePath: "projects/reading-room.jpg",
  mediaType: "image",
  altText: "Reading room shelving",
  caption: "Oak shelving detail",
  photographer: null,
  width: 1600,
  height: 1000,
  posterPath: null,
  mimeType: "image/jpeg",
  isArchived: false,
  fileSizeBytes: 240000,
  createdAt: "2026-08-30T10:00:00.000Z",
  updatedAt: "2026-08-30T10:00:00.000Z",
};

const service: AdminServiceDetail = {
  id: "service-1",
  slug: "interior-direction",
  name: "Interior direction",
  shortDescription: "A clear design direction for considered spaces.",
  media,
  sortOrder: 0,
  fullDescription: "Full description",
  idealClient: "Homeowners",
  scope: ["Strategy"],
  deliverables: ["Concept package"],
  included: ["Consultation"],
  excluded: [],
  typicalProjectTypes: ["Residential"],
  featured: true,
  status: "published",
};

const processStep: AdminProcessStep = {
  id: "process-1",
  stepNo: 1,
  title: "Listen",
  description: "Understand the people and rituals inside the project.",
  media,
  sortOrder: 0,
  status: "published",
};

const exploration: AdminExplorationSummary = {
  id: "exploration-1",
  slug: "quiet-materials",
  title: "Quiet materials",
  category: "Material study",
  description: "A study of tactility.",
  year: 2026,
  coverMedia: media,
  sortOrder: 0,
  status: "draft",
};

const explorationMedia: ExplorationMediaItem = {
  id: "exploration-media-1",
  explorationId: exploration.id,
  mediaId: media.id,
  caption: "Oak grain",
  sortOrder: 0,
  media,
};

const testimonial: AdminTestimonial = {
  id: "testimonial-1",
  clientName: "A. Client",
  clientRole: "Founder",
  projectName: "Reading room",
  quote: "The process made every decision feel intentional.",
  sortOrder: 0,
  featured: true,
  status: "published",
};

const inquiry: InquiryRecord = {
  id: "inquiry-1",
  name: "Maya Client",
  email: "maya@example.com",
  phone: null,
  projectType: "Apartment renovation",
  projectLocation: "Bandung",
  areaSqm: 92,
  requiredService: "Interior direction",
  projectStatus: "Planning",
  desiredTimeline: "This year",
  budgetRange: null,
  projectBrief: "A calm apartment for long-term living.",
  referralSource: "Referral",
  status: "new",
  adminNotes: null,
  submittedAt: "2026-08-30T10:00:00.000Z",
  updatedAt: "2026-08-30T10:00:00.000Z",
};

describe("admin collection screens", () => {
  it("supports service CRUD controls and confirms deletion", async () => {
    const user = userEvent.setup();
    render(<ServicesCollectionScreen initialItems={[service]} />);

    await user.click(screen.getByRole("button", { name: "Add service" }));
    await user.type(screen.getByLabelText(/^Name/), "Lighting study");
    await user.type(screen.getByLabelText(/^Slug/), "lighting-study");
    await user.type(screen.getByLabelText(/^Short description/), "A lighting plan.");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByText("Lighting study")).toBeInTheDocument();
    const deleteButton = screen.getAllByRole("button", { name: "Delete" })[1];
    if (!deleteButton) throw new Error("Expected the newly created service delete button.");
    await user.click(deleteButton);
    expect(screen.getByRole("dialog")).toHaveTextContent("Delete Lighting study?");
    await user.click(screen.getByRole("button", { name: "Delete service" }));
    expect(screen.queryByText("Lighting study")).not.toBeInTheDocument();
  });

  it("renders ordered process editing and exploration media controls", async () => {
    const user = userEvent.setup();
    const processView = render(<ProcessCollectionScreen initialItems={[processStep]} />);
    expect(screen.getByRole("button", { name: "Move 1. Listen" })).toBeInTheDocument();

    processView.unmount();
    render(
      <ExplorationsCollectionScreen
        initialItems={[exploration]}
        initialMedia={[explorationMedia]}
        mediaAssets={[media]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getAllByText(media.altText)).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Add media" }));
    expect(screen.getAllByRole("group", { name: "Media" })).toHaveLength(2);
  });

  it("supports testimonial editing and featured state", async () => {
    const user = userEvent.setup();
    render(<TestimonialsCollectionScreen initialItems={[testimonial]} />);

    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByLabelText(/^Client name/)).toHaveValue("A. Client");
    expect(screen.getByLabelText("Show in featured credibility content")).toBeChecked();
  });

  it("queues media through the upload modal and confirms archiving", async () => {
    const user = userEvent.setup();
    render(<MediaCollectionScreen initialItems={[]} />);

    await user.click(screen.getByRole("button", { name: "Upload media" }));
    const file = new File(["image"], "studio.jpg", { type: "image/jpeg" });
    fireEvent.change(screen.getByLabelText(/^File/), { target: { files: [file] } });
    await user.type(screen.getByLabelText(/^Alt text/), "Studio detail");
    await user.click(screen.getByRole("button", { name: "Queue upload" }));

    expect(screen.getByText("Studio detail")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Archive" }));
    await user.click(screen.getByRole("button", { name: "Archive asset" }));
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });

  it("filters inquiries and edits internal follow-up state", async () => {
    const user = userEvent.setup();
    render(<InquiriesCollectionScreen initialItems={[inquiry]} />);
    expect(screen.getByRole("link", { name: "View detail" })).toHaveAttribute(
      "href",
      `/admin/inquiries/${inquiry.id}`,
    );

    await user.selectOptions(
      screen.getByLabelText("Status", { selector: "#inquiry-status-filter" }),
      "qualified",
    );
    expect(screen.getByText("No inquiries yet.")).toBeInTheDocument();

    const detailView = render(<InquiryDetailScreen inquiry={inquiry} />);
    await user.selectOptions(
      detailView.getByLabelText("Status", { selector: "#inquiry-detail-status" }),
      "contacted",
    );
    await user.type(screen.getByLabelText("Internal notes"), "Call next week.");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });
});
