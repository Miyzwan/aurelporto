/**
 * Public view models.
 *
 * These are the shapes the presentation layer consumes. They are intentionally
 * decoupled from `types/database.generated.ts` (BE-013) so that the repository
 * layer in INT-004 owns the mapping from snake_case rows to camelCase view
 * models, and components never import database types directly.
 */

export type ContentStatus = "draft" | "published" | "archived";

export const PAGE_SECTION_TYPES = [
  "home_hero",
  "positioning",
  "featured_projects",
  "philosophy",
  "services_preview",
  "process_preview",
  "material_moment",
  "credibility",
  "cta",
  "rich_text",
  "gallery",
] as const;

export type PageSectionType = (typeof PAGE_SECTION_TYPES)[number];

export type NavigationPlacement = "header" | "footer" | "social";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  placement: NavigationPlacement;
  sortOrder: number;
  isVisible: boolean;
  targetBlank: boolean;
}

export interface SocialLink {
  label: string;
  href: string;
}

/**
 * Mirrors the `site_settings` singleton. Every optional field is genuinely
 * optional: the shell must render correctly when the designer has not yet
 * supplied a phone number, WhatsApp handle, or any social account.
 */
export interface SiteSettings {
  siteName: string;
  professionalRole: string;
  location: string | null;
  serviceArea: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  socialLinks: SocialLink[];
  footerText: string | null;
  defaultSeoTitle?: string | null;
  defaultSeoDescription?: string | null;
  defaultOgMediaId?: string | null;
}

export interface CallToAction {
  label: string;
  href: string;
  targetBlank?: boolean;
}

export type MediaType = "image" | "video";

/**
 * Presentation view model for a row of `media_assets`.
 *
 * `width`/`height` are nullable because the admin uploader cannot always probe
 * intrinsic dimensions. Media components therefore never rely on them for
 * layout stability — they reserve space from an aspect ratio instead.
 */
export interface MediaAsset {
  id: string;
  bucket: string;
  storagePath: string;
  mediaType: MediaType;
  altText: string;
  caption: string | null;
  photographer: string | null;
  width: number | null;
  height: number | null;
  posterPath: string | null;
  mimeType: string;
}

/** Admin-only extensions kept separate from the public presentation model. */
export interface AdminMediaAsset extends MediaAsset {
  isArchived: boolean;
  fileSizeBytes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaUploadInput {
  bucket: "portfolio-public";
  storagePath: string;
  mediaType: MediaType;
  altText: string;
  caption: string | null;
  photographer: string | null;
  width: number | null;
  height: number | null;
  posterPath: string | null;
  mimeType: string;
  fileSizeBytes: number;
}

export interface MediaArchiveInput {
  id: string;
  isArchived: boolean;
}

/* -------------------------------------------------------------------------
   Collection view models
------------------------------------------------------------------------- */

export type ProjectStatus = "concept" | "ongoing" | "completed";

/** The fields a project card needs. Case studies extend this in FE-007. */
export interface ProjectSummary {
  id: string;
  slug: string;
  title: string;
  year: number;
  location: string;
  projectType: string;
  areaSqm: number | null;
  projectStatus: ProjectStatus;
  summary: string;
  heroMedia: MediaAsset | null;
  featured: boolean;
  featuredOrder: number;
  sortOrder: number;
}

import type { ProjectSectionContent, ProjectSectionType } from "./project-sections";

export interface ProjectDetail extends ProjectSummary {
  clientType: string | null;
  designRole: string[];
  services: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  ogMedia: MediaAsset | null;
}

export interface AdminProjectDetail extends ProjectDetail {
  status: ContentStatus;
  heroMediaId: string | null;
  ogMediaId: string | null;
}

export interface ServiceSummary {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  media: MediaAsset | null;
  sortOrder: number;
}

export interface ProcessStep {
  id: string;
  stepNo: number;
  title: string;
  description: string;
  media: MediaAsset | null;
  sortOrder: number;
}

export interface AdminProcessStep extends ProcessStep {
  status: ContentStatus;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientRole: string | null;
  projectName: string | null;
  quote: string;
  sortOrder: number;
}

export interface AdminTestimonial extends Testimonial {
  featured: boolean;
  status: ContentStatus;
}

export interface ExplorationSummary {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string | null;
  year: number | null;
  coverMedia: MediaAsset | null;
  sortOrder: number;
}

export interface AdminServiceDetail extends ServiceDetail {
  featured: boolean;
  status: ContentStatus;
}

export interface AdminExplorationSummary extends ExplorationSummary {
  status: ContentStatus;
}

export interface ExplorationMediaItem {
  id: string;
  explorationId: string;
  mediaId: string;
  caption: string | null;
  sortOrder: number;
  media: MediaAsset | null;
}

/** Inputs shared by the admin collection Server Actions and their editors. */
export interface ServiceMutationInput {
  id?: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  idealClient: string;
  scope: string[];
  deliverables: string[];
  included: string[];
  excluded: string[];
  typicalProjectTypes: string[];
  mediaId: string | null;
  sortOrder: number;
  featured: boolean;
  status: ContentStatus;
}

export interface ProcessStepMutationInput {
  id?: string;
  stepNo: number;
  title: string;
  description: string;
  mediaId: string | null;
  sortOrder: number;
  status: ContentStatus;
}

export interface ExplorationMediaMutationInput {
  id?: string;
  explorationId: string;
  mediaId: string;
  caption: string;
  sortOrder: number;
}

export interface ExplorationMutationInput {
  id?: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  year: number | null;
  coverMediaId: string | null;
  sortOrder: number;
  status: ContentStatus;
}

export interface ExplorationMediaSyncInput {
  explorationId: string;
  items: ExplorationMediaMutationInput[];
}

export interface TestimonialMutationInput {
  id?: string;
  clientName: string;
  clientRole: string;
  projectName: string;
  quote: string;
  sortOrder: number;
  featured: boolean;
  status: ContentStatus;
}

/* -------------------------------------------------------------------------
   Page section content shapes

   These mirror the canonical JSON in master plan section 5 exactly. INT-004
   validates the same shapes with Zod; keep the two in step.
------------------------------------------------------------------------- */

export interface HomeHeroContent {
  eyebrow: string;
  headline: string;
  subheadline: string;
  location: string;
  heroMediaId: string | null;
  signatureProjectId: string | null;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface PositioningContent {
  eyebrow: string;
  lines: string[];
  body: string;
}

export interface FeaturedProjectsContent {
  title: string;
  intro: string;
  maxItems: number;
}

export interface PhilosophyItem {
  title: string;
  body: string;
}

export interface PhilosophyContent {
  title: string;
  intro: string;
  items: PhilosophyItem[];
}

export interface ServicesPreviewContent {
  title: string;
  intro: string;
  maxItems: number;
}

export interface ProcessPreviewContent {
  title: string;
  intro: string;
  maxItems: number;
}

export interface MaterialMomentContent {
  title: string;
  intro: string;
  mediaIds: string[];
}

export interface CredibilityStat {
  value: string;
  label: string;
}

export interface CredibilityContent {
  title: string;
  stats: CredibilityStat[];
  testimonialIds: string[];
}

export interface CtaContent {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface RichTextContent {
  title: string;
  body: string;
}

export interface GalleryContent {
  title: string;
  intro: string;
  mediaIds: string[];
}

export type PageSectionContent =
  | HomeHeroContent
  | PositioningContent
  | FeaturedProjectsContent
  | PhilosophyContent
  | ServicesPreviewContent
  | ProcessPreviewContent
  | MaterialMomentContent
  | CredibilityContent
  | CtaContent
  | RichTextContent
  | GalleryContent;

export interface Page {
  id: string;
  slug: string;
  title: string;
  navLabel: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogMediaId: string | null;
  status: ContentStatus;
}

export interface PageSection {
  id: string;
  pageId: string;
  sectionKey: string;
  sectionType: PageSectionType;
  content: PageSectionContent;
  settings: Record<string, unknown>;
  sortOrder: number;
  isEnabled: boolean;
  status: ContentStatus;
}

/**
 * Mirrors `site_settings.inquiry_config`. Every option list is CMS-owned so the
 * contact form can be re-scoped without a deploy.
 */
export interface InquiryConfig {
  projectTypes: string[];
  projectStatuses: string[];
  timelineOptions: string[];
  budgetOptions: string[];
  showBudgetField: boolean;
  showPhoneField: boolean;
  successTitle: string;
  successBody: string;
}

export interface ServiceDetail extends ServiceSummary {
  fullDescription: string | null;
  idealClient: string | null;
  scope: string[];
  deliverables: string[];
  included: string[];
  excluded: string[];
  typicalProjectTypes: string[];
}

/** A capability the designer works with — tool plus what it is used for. */
export interface SoftwareCapability {
  name: string;
  application: string;
}

export interface EducationEntry {
  institution: string;
  qualification: string | null;
  detail: string | null;
  period: string | null;
}

export interface ExperienceEntry {
  title: string;
  organisation: string | null;
  year: string;
  description: string;
}

export interface InquiryRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  projectType: string;
  projectLocation: string;
  areaSqm: number | null;
  requiredService: string;
  projectStatus: string;
  desiredTimeline: string;
  budgetRange: string | null;
  projectBrief: string;
  referralSource: string | null;
  status: "new" | "contacted" | "qualified" | "won" | "lost" | "spam";
  adminNotes: string | null;
  submittedAt: string;
  updatedAt: string;
}

export interface AdminSiteSettings extends SiteSettings {
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgMediaId: string | null;
  inquiryConfig: InquiryConfig;
}

export interface SiteSettingsMutationInput {
  siteName: string;
  professionalRole: string;
  location: string | null;
  serviceArea: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  socialLinks: SocialLink[];
  footerText: string | null;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgMediaId: string | null;
  inquiryConfig: InquiryConfig;
}

export interface NavigationItemMutationInput {
  id?: string;
  label: string;
  href: string;
  placement: NavigationPlacement;
  sortOrder: number;
  isVisible: boolean;
  targetBlank: boolean;
}

export interface PageMetadataMutationInput {
  id?: string;
  slug: string;
  title: string;
  navLabel: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogMediaId: string | null;
  status: ContentStatus;
}

export interface PageSectionMutationInput {
  id?: string;
  pageId: string;
  sectionKey: string;
  sectionType: PageSectionType;
  content: PageSectionContent;
  settings?: Record<string, unknown>;
  sortOrder?: number;
  isEnabled: boolean;
  status: ContentStatus;
}

export interface ProjectMutationInput {
  id?: string;
  slug: string;
  title: string;
  year: number;
  location: string;
  projectType: string;
  areaSqm: number | null;
  projectStatus: ProjectStatus;
  clientType: string | null;
  designRole: string[];
  services: string[];
  summary: string;
  heroMediaId: string | null;
  featured: boolean;
  featuredOrder: number;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  ogMediaId: string | null;
  status: ContentStatus;
}

export interface ProjectSectionMutationInput {
  id?: string;
  projectId: string;
  sectionKey: string;
  sectionType: ProjectSectionType;
  title?: string | null;
  content: ProjectSectionContent;
  sortOrder?: number;
  isEnabled: boolean;
}
