import type { CallToAction, NavigationItem, SiteSettings } from "@/types/content";

/**
 * TEMPORARY typed fixtures for the static frontend tasks (FE-003..FE-008).
 *
 * INT-005 replaces every consumer of this module with Supabase reads. Nothing
 * here may leak into the final data path, and no component may import it
 * outside of a route file or a test.
 *
 * Copy follows CLIENT_CONTEXT section 29: no invented facts, no studio
 * positioning, no contact details published before the client confirms them.
 */

export const placeholderSiteSettings: SiteSettings = {
  siteName: "Gabrielle Aurelia Sulistya",
  professionalRole: "Interior Designer & Spatial Visualizer",
  location: null,
  serviceArea: null,
  // NEEDS_CONFIRMATION — client context section 4 requires the client to verify
  // the public email, phone, and WhatsApp number before launch.
  email: null,
  phone: null,
  whatsapp: null,
  socialLinks: [],
  footerText: null,
};

export const placeholderHeaderNavigation: NavigationItem[] = [
  { label: "Projects", href: "/projects" },
  { label: "Services", href: "/services" },
  { label: "Process", href: "/process" },
  { label: "About", href: "/about" },
  { label: "Explorations", href: "/explorations" },
  { label: "Contact", href: "/contact" },
].map((item, index) => ({
  ...item,
  id: `header-${item.href}`,
  placement: "header" as const,
  sortOrder: index,
  isVisible: true,
  targetBlank: false,
}));

export const placeholderFooterNavigation: NavigationItem[] = [
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
].map((item, index) => ({
  ...item,
  id: `footer-${item.href}`,
  placement: "footer" as const,
  sortOrder: index,
  isVisible: true,
  targetBlank: false,
}));

/**
 * The master plan calls this the "Start a Project" CTA slot. The label is
 * deliberately neutral here: CLIENT_CONTEXT section 32 forbids a commission-
 * seeking CTA until the client confirms she is accepting client work. The slot
 * itself is what the shell provides — the label is CMS-owned from INT-005.
 */
export const placeholderHeaderCta: CallToAction = {
  label: "Contact",
  href: "/contact",
};
