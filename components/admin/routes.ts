export interface AdminNavigationItem {
  href: string;
  label: string;
  group: "Overview" | "Content" | "Operations";
}

/**
 * Top-level admin destinations. Detail, create, and preview routes are
 * intentionally represented by their parent destination rather than adding
 * duplicate sidebar entries.
 */
export const adminNavigation: readonly AdminNavigationItem[] = [
  { href: "/admin", label: "Dashboard", group: "Overview" },
  { href: "/admin/site", label: "Site", group: "Content" },
  { href: "/admin/navigation", label: "Navigation", group: "Content" },
  { href: "/admin/pages", label: "Pages", group: "Content" },
  { href: "/admin/projects", label: "Projects", group: "Content" },
  { href: "/admin/services", label: "Services", group: "Content" },
  { href: "/admin/process", label: "Process", group: "Content" },
  { href: "/admin/explorations", label: "Explorations", group: "Content" },
  { href: "/admin/testimonials", label: "Testimonials", group: "Content" },
  { href: "/admin/media", label: "Media", group: "Content" },
  { href: "/admin/inquiries", label: "Inquiries", group: "Operations" },
];

export function isAdminNavigationActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminPageLabel(pathname: string) {
  return (
    adminNavigation.find((item) => isAdminNavigationActive(pathname, item.href))?.label ??
    "Admin workspace"
  );
}
