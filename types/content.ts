/**
 * Public view models.
 *
 * These are the shapes the presentation layer consumes. They are intentionally
 * decoupled from `types/database.generated.ts` (BE-013) so that the repository
 * layer in INT-004 owns the mapping from snake_case rows to camelCase view
 * models, and components never import database types directly.
 */

export type ContentStatus = "draft" | "published" | "archived";

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
}

export interface CallToAction {
  label: string;
  href: string;
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
