import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerSupabaseClient: vi.fn(),
  createSecretSupabaseClient: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  getPublicInquiryConfig: vi.fn(),
  mapInquiry: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: mocks.createServerSupabaseClient,
}));
vi.mock("@/lib/supabase/secret", () => ({
  createSecretSupabaseClient: mocks.createSecretSupabaseClient,
}));
vi.mock("@/lib/data/site", () => ({
  getPublicInquiryConfig: mocks.getPublicInquiryConfig,
}));
vi.mock("@/lib/data/inquiries", () => ({
  mapInquiry: mocks.mapInquiry,
}));

import { submitInquiry, updateInquiry } from "@/lib/actions/inquiries";
import type { PublicInquiryInput } from "@/lib/validation/inquiries";

const ADMIN_ID = "00000000-0000-4000-8000-000000000001";
const INQUIRY_ID = "00000000-0000-4000-8000-000000000002";

function query<T>(data: T, error: unknown = null) {
  const builder = {
    data,
    error,
    delete: vi.fn(),
    eq: vi.fn(),
    insert: vi.fn(),
    maybeSingle: vi.fn(),
    order: vi.fn(),
    select: vi.fn(),
    single: vi.fn(),
    then: vi.fn(),
    update: vi.fn(),
  };
  builder.delete.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.insert.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.select.mockReturnValue(builder);
  builder.update.mockReturnValue(builder);
  builder.maybeSingle.mockResolvedValue({ data, error });
  builder.single.mockResolvedValue({ data, error });
  builder.then.mockImplementation((resolve: (value: { data: T; error: unknown }) => unknown) =>
    Promise.resolve(resolve({ data, error })),
  );
  return builder;
}

const defaultConfig = {
  projectTypes: ["Hospitality", "Retail", "Office", "Furniture", "Other"],
  projectStatuses: ["New Build", "Renovation", "Furnishing Only", "Still Exploring"],
  timelineOptions: ["Immediately", "1–3 Months", "3–6 Months", "6+ Months", "Flexible"],
  budgetOptions: ["$10k - $25k", "$25k - $50k"],
  showBudgetField: true,
  showPhoneField: true,
  successTitle: "Inquiry received",
  successBody: "We will get back to you shortly.",
};

const validInquiryInput: PublicInquiryInput = {
  name: " Jane Doe ",
  email: " JANE@example.COM ",
  phone: " +62 812 3456 7890 ",
  projectType: " Hospitality ",
  projectLocation: " Jakarta ",
  areaSqm: " 150 ",
  requiredService: " Interior Design ",
  projectStatus: " Renovation ",
  desiredTimeline: " 1–3 Months ",
  budgetRange: " $10k - $25k ",
  projectBrief: " A boutique cafe project in central Jakarta. ",
  referralSource: " Instagram ",
  company: "",
};

describe("submitInquiry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPublicInquiryConfig.mockResolvedValue(defaultConfig);
  });

  it("submits valid inquiry using the secret client and revalidates", async () => {
    const secretBuilder = query({ id: INQUIRY_ID });
    mocks.createSecretSupabaseClient.mockReturnValue({
      from: vi.fn().mockReturnValue(secretBuilder),
    });

    const result = await submitInquiry(validInquiryInput);

    expect(result).toEqual({
      ok: true,
      data: {
        successTitle: "Inquiry received",
        successBody: "We will get back to you shortly.",
      },
      message: "We will get back to you shortly.",
    });

    expect(secretBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "+62 812 3456 7890",
        project_type: "Hospitality",
        project_location: "Jakarta",
        area_sqm: 150,
        required_service: "Interior Design",
        project_status: "Renovation",
        desired_timeline: "1–3 Months",
        budget_range: "$10k - $25k",
        project_brief: "A boutique cafe project in central Jakarta.",
        referral_source: "Instagram",
        status: "new",
      }),
    );

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/inquiries");
  });

  it("immediately rejects submission when honeypot has content without touching DB", async () => {
    const result = await submitInquiry({
      ...validInquiryInput,
      company: "SpamBot Inc",
    });

    if (result.ok) throw new Error("Expected inquiry submission to fail.");
    expect(result.formError).toContain("could not be processed");
    expect(mocks.createSecretSupabaseClient).not.toHaveBeenCalled();
  });

  it("returns validation field errors when required fields are missing", async () => {
    const result = await submitInquiry({
      name: "",
      email: "not-an-email",
      projectType: "",
      projectLocation: "",
      requiredService: "",
      projectStatus: "",
      desiredTimeline: "",
      projectBrief: "",
    });

    if (result.ok) throw new Error("Expected inquiry submission to fail.");
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.name).toBeDefined();
    expect(result.fieldErrors?.email).toBeDefined();
    expect(result.fieldErrors?.projectType).toBeDefined();
  });

  it("discards phone and budget when config disables them", async () => {
    mocks.getPublicInquiryConfig.mockResolvedValue({
      ...defaultConfig,
      showPhoneField: false,
      showBudgetField: false,
    });

    const secretBuilder = query({ id: INQUIRY_ID });
    mocks.createSecretSupabaseClient.mockReturnValue({
      from: vi.fn().mockReturnValue(secretBuilder),
    });

    const result = await submitInquiry(validInquiryInput);

    expect(result.ok).toBe(true);
    expect(secretBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        phone: null,
        budget_range: null,
      }),
    );
  });

  it("returns generic error on database failure without leaking error details", async () => {
    const secretBuilder = query(null, new Error("database connection timeout"));
    mocks.createSecretSupabaseClient.mockReturnValue({
      from: vi.fn().mockReturnValue(secretBuilder),
    });

    const result = await submitInquiry(validInquiryInput);

    if (result.ok) throw new Error("Expected inquiry submission to fail on DB error.");
    expect(result.formError).toBe(
      "We could not submit your inquiry at this moment. Please try again later.",
    );
  });
});

describe("updateInquiry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue({ userId: ADMIN_ID, displayName: "Admin" });
  });

  it("updates inquiry status and admin notes under admin authorization", async () => {
    const dbRow = {
      id: INQUIRY_ID,
      status: "contacted",
      admin_notes: "Follow up next Tuesday.",
    };
    const serverBuilder = query(dbRow);
    mocks.createServerSupabaseClient.mockResolvedValue({
      from: vi.fn().mockReturnValue(serverBuilder),
    });
    mocks.mapInquiry.mockReturnValue({
      id: INQUIRY_ID,
      status: "contacted",
      adminNotes: "Follow up next Tuesday.",
    });

    const result = await updateInquiry({
      id: INQUIRY_ID,
      status: "contacted",
      adminNotes: "  Follow up next Tuesday.  ",
    });

    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(result).toEqual({
      ok: true,
      data: {
        id: INQUIRY_ID,
        status: "contacted",
        adminNotes: "Follow up next Tuesday.",
      },
      message: "Inquiry updated.",
    });

    expect(serverBuilder.update).toHaveBeenCalledWith({
      status: "contacted",
      admin_notes: "Follow up next Tuesday.",
    });
    expect(serverBuilder.eq).toHaveBeenCalledWith("id", INQUIRY_ID);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/inquiries");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/admin/inquiries/${INQUIRY_ID}`);
  });

  it("returns field errors for invalid status or ID", async () => {
    const result = await updateInquiry({
      id: "invalid-uuid",
      // @ts-expect-error test invalid status
      status: "not-a-valid-status",
    });

    if (result.ok) throw new Error("Expected updateInquiry to fail for invalid input.");
    expect(result.fieldErrors).toBeDefined();
    expect(mocks.requireAdmin).not.toHaveBeenCalled();
  });
});
