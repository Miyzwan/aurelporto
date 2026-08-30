import { describe, expect, it } from "vitest";

import { mapExploration, mapExplorationMedia } from "@/lib/data/explorations";
import { mapInquiry } from "@/lib/data/inquiries";
import { mapMediaAsset } from "@/lib/data/media";
import { mapPage, mapPageSection } from "@/lib/data/pages";
import { mapProcessStep } from "@/lib/data/process";
import { mapAdminProjectDetail, mapProjectDetail, mapProjectSummary } from "@/lib/data/projects";
import { mapServiceDetail } from "@/lib/data/services";
import { mapAdminSiteSettings, mapNavigationItem, mapSiteSettings } from "@/lib/data/site";
import { mapTestimonial } from "@/lib/data/testimonials";
import type { Tables } from "@/types/database.generated";

const UUID_1 = "00000000-0000-4000-8000-000000000001";
const UUID_2 = "00000000-0000-4000-8000-000000000002";

describe("Repository mappings for empty and optional data (INT-016)", () => {
  describe("Site and Navigation Mappings", () => {
    it("maps site settings with null optional fields", () => {
      const row: Tables<"site_settings"> = {
        id: 1,
        site_name: "Gabrielle Aurelia",
        professional_role: "Interior Designer",
        location: null,
        service_area: null,
        email: null,
        phone: null,
        whatsapp: null,
        social_links: [],
        footer_text: null,
        default_seo_title: "Gabrielle Aurelia — Interior Designer",
        default_seo_description: "Quiet material balance and timeless architectural interiors.",
        default_og_media_id: null,
        inquiry_config: {
          projectTypes: [],
          projectStatuses: [],
          timelineOptions: [],
          budgetOptions: [],
          showBudgetField: false,
          showPhoneField: false,
          successTitle: "Thanks",
          successBody: "Received",
        },
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      const publicSettings = mapSiteSettings(row);
      expect(publicSettings.location).toBeNull();
      expect(publicSettings.phone).toBeNull();
      expect(publicSettings.socialLinks).toEqual([]);

      const adminSettings = mapAdminSiteSettings(row);
      expect(adminSettings.defaultOgMediaId).toBeNull();
      expect(adminSettings.inquiryConfig.projectTypes).toEqual([]);
    });

    it("maps navigation items", () => {
      const row: Tables<"navigation_items"> = {
        id: UUID_1,
        label: "About",
        href: "/about",
        placement: "header",
        sort_order: 0,
        is_visible: true,
        target_blank: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      expect(mapNavigationItem(row)).toEqual({
        id: UUID_1,
        label: "About",
        href: "/about",
        placement: "header",
        sortOrder: 0,
        isVisible: true,
        targetBlank: false,
      });
    });
  });

  describe("Page and Page Section Mappings", () => {
    it("maps pages with optional SEO fields as null", () => {
      const row: Tables<"pages"> = {
        id: UUID_1,
        slug: "contact",
        title: "Contact Studio",
        nav_label: null,
        seo_title: null,
        seo_description: null,
        og_media_id: null,
        status: "published",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      expect(mapPage(row)).toEqual({
        id: UUID_1,
        slug: "contact",
        title: "Contact Studio",
        navLabel: null,
        seoTitle: null,
        seoDescription: null,
        ogMediaId: null,
        status: "published",
      });
    });

    it("maps page sections with parsed JSON content", () => {
      const row: Tables<"page_sections"> = {
        id: UUID_1,
        page_id: UUID_2,
        section_key: "intro",
        section_type: "positioning",
        content: {
          eyebrow: "",
          lines: ["Minimalist geometry."],
          body: "Timeless warmth.",
        },
        settings: {},
        sort_order: 0,
        is_enabled: true,
        status: "published",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      expect(mapPageSection(row)).toMatchObject({
        id: UUID_1,
        sectionType: "positioning",
        isEnabled: true,
      });
    });
  });

  describe("Project Mappings", () => {
    const rawProjectRow: Tables<"projects"> = {
      id: UUID_1,
      slug: "menteng-sanctuary",
      title: "Menteng Sanctuary",
      year: 2025,
      location: "Jakarta",
      project_type: "Residential",
      area_sqm: null,
      project_status: "completed",
      client_type: null,
      design_role: [],
      services: [],
      summary: "Sanctuary narrative",
      hero_media_id: null,
      featured: false,
      featured_order: 0,
      sort_order: 0,
      seo_title: null,
      seo_description: null,
      og_media_id: null,
      status: "published",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    };

    it("maps project summary with missing hero media", () => {
      const summary = mapProjectSummary(rawProjectRow, {});
      expect(summary.heroMedia).toBeNull();
      expect(summary.areaSqm).toBeNull();
      expect(summary.featured).toBe(false);
    });

    it("maps project detail with empty arrays and null optional fields", () => {
      const detail = mapProjectDetail(rawProjectRow, {});
      expect(detail.clientType).toBeNull();
      expect(detail.designRole).toEqual([]);
      expect(detail.services).toEqual([]);
      expect(detail.seoTitle).toBeNull();
    });

    it("maps admin project detail", () => {
      const adminDetail = mapAdminProjectDetail(rawProjectRow, {});
      expect(adminDetail.heroMediaId).toBeNull();
      expect(adminDetail.status).toBe("published");
    });
  });

  describe("Collection Mappings (Services, Process, Explorations, Testimonials)", () => {
    it("maps services detail with empty array scopes", () => {
      const row: Tables<"services"> = {
        id: UUID_1,
        slug: "interior-design",
        name: "Interior Design",
        short_description: "Full interior design planning.",
        full_description: null,
        ideal_client: null,
        scope: [],
        deliverables: [],
        included: [],
        excluded: [],
        typical_project_types: [],
        media_id: null,
        sort_order: 0,
        featured: false,
        status: "published",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      const detail = mapServiceDetail(row, {});
      expect(detail.fullDescription).toBeNull();
      expect(detail.scope).toEqual([]);
      expect(detail.media).toBeNull();
    });

    it("maps process steps with null media", () => {
      const row: Tables<"process_steps"> = {
        id: UUID_1,
        step_no: 1,
        title: "Briefing",
        description: "Initial discovery discussion.",
        media_id: null,
        sort_order: 0,
        status: "published",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      expect(mapProcessStep(row, {})).toEqual({
        id: UUID_1,
        stepNo: 1,
        title: "Briefing",
        description: "Initial discovery discussion.",
        media: null,
        sortOrder: 0,
        status: "published",
      });
    });

    it("maps explorations and exploration media", () => {
      const row: Tables<"explorations"> = {
        id: UUID_1,
        slug: "materials-1",
        title: "Material Study",
        category: "Study",
        description: null,
        year: null,
        cover_media_id: null,
        sort_order: 0,
        status: "published",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      expect(mapExploration(row, {})).toEqual({
        id: UUID_1,
        slug: "materials-1",
        title: "Material Study",
        category: "Study",
        description: null,
        year: null,
        coverMedia: null,
        sortOrder: 0,
        status: "published",
      });

      const mediaRow: Tables<"exploration_media"> = {
        id: UUID_2,
        exploration_id: UUID_1,
        media_id: UUID_1,
        caption: null,
        sort_order: 0,
        created_at: "2026-01-01T00:00:00Z",
      };

      expect(mapExplorationMedia(mediaRow, {})).toEqual({
        id: UUID_2,
        explorationId: UUID_1,
        mediaId: UUID_1,
        caption: null,
        sortOrder: 0,
        media: null,
      });
    });

    it("maps testimonials with optional fields", () => {
      const row: Tables<"testimonials"> = {
        id: UUID_1,
        client_name: "Private Client",
        client_role: null,
        project_name: null,
        quote: "Thoughtful spatial layout.",
        sort_order: 0,
        featured: true,
        status: "published",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      expect(mapTestimonial(row)).toEqual({
        id: UUID_1,
        clientName: "Private Client",
        clientRole: null,
        projectName: null,
        quote: "Thoughtful spatial layout.",
        sortOrder: 0,
        featured: true,
        status: "published",
      });
    });
  });

  describe("Inquiries and Media Mappings", () => {
    it("maps inquiry record with optional admin notes", () => {
      const row: Tables<"inquiries"> = {
        id: UUID_1,
        name: "Jane Client",
        email: "jane@example.com",
        phone: null,
        project_type: "Residential",
        project_location: "Jakarta",
        area_sqm: null,
        required_service: "Full Design",
        project_status: "Planning",
        desired_timeline: "3 months",
        budget_range: null,
        project_brief: "Renovation inquiry",
        referral_source: null,
        status: "new",
        admin_notes: null,
        submitted_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      expect(mapInquiry(row)).toEqual({
        id: UUID_1,
        name: "Jane Client",
        email: "jane@example.com",
        phone: null,
        projectType: "Residential",
        projectLocation: "Jakarta",
        areaSqm: null,
        requiredService: "Full Design",
        projectStatus: "Planning",
        desiredTimeline: "3 months",
        budgetRange: null,
        projectBrief: "Renovation inquiry",
        referralSource: null,
        status: "new",
        adminNotes: null,
        submittedAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      });
    });

    it("maps media asset records", () => {
      const row: Tables<"media_assets"> = {
        id: UUID_1,
        bucket: "portfolio-public",
        storage_path: "portfolio/2026/00000000-0000-4000-8000-000000000001-hero.jpg",
        media_type: "image",
        alt_text: "Hero image",
        caption: null,
        photographer: null,
        width: 1920,
        height: 1080,
        poster_path: null,
        mime_type: "image/jpeg",
        file_size_bytes: 102400,
        is_archived: false,
        created_by: UUID_2,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      };

      expect(mapMediaAsset(row)).toEqual({
        id: UUID_1,
        bucket: "portfolio-public",
        storagePath: "portfolio/2026/00000000-0000-4000-8000-000000000001-hero.jpg",
        mediaType: "image",
        altText: "Hero image",
        caption: null,
        photographer: null,
        width: 1920,
        height: 1080,
        posterPath: null,
        mimeType: "image/jpeg",
        fileSizeBytes: 102400,
        isArchived: false,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      });
    });
  });
});
