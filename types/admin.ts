import type {
  AdminMediaAsset,
  AdminProjectDetail,
  AdminServiceDetail,
  AdminSiteSettings,
  ContentStatus,
  InquiryRecord,
  NavigationItem,
  Page,
  ProcessStep,
  Testimonial,
} from "@/types/content";

export interface AdminUserSession {
  id: string;
  email: string;
}

export type AdminTab =
  | "overview"
  | "projects"
  | "pages"
  | "services"
  | "process"
  | "explorations"
  | "inquiries"
  | "media"
  | "site"
  | "navigation"
  | "testimonials";

export interface AdminDashboardMetrics {
  publishedProjectsCount: number;
  draftProjectsCount: number;
  unresolvedInquiriesCount: number;
  totalMediaAssetsCount: number;
}

export type {
  AdminMediaAsset,
  AdminProjectDetail,
  AdminServiceDetail,
  AdminSiteSettings,
  ContentStatus,
  InquiryRecord,
  NavigationItem,
  Page,
  ProcessStep,
  Testimonial,
};
