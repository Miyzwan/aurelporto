/**
 * PRD Event definitions for Aurelia Interior Portfolio.
 * Strictly non-PII payloads: personal data, contact texts, names, phones,
 * emails, budget quantities, or custom notes are disallowed.
 */

export const PRD_EVENT_NAMES = [
  "hero_view_projects_click",
  "hero_start_project_click",
  "featured_project_click",
  "project_filter_used",
  "project_next_click",
  "service_view",
  "contact_start",
  "contact_submit",
  "whatsapp_click",
  "email_click",
  "instagram_click",
] as const;

export type PortfolioEventName = (typeof PRD_EVENT_NAMES)[number];

export interface PortfolioEventMap {
  hero_view_projects_click: {
    placement?: string;
  };
  hero_start_project_click: {
    placement?: string;
  };
  featured_project_click: {
    project_slug: string;
    project_type?: string;
    sort_order?: number;
  };
  project_filter_used: {
    category: string;
  };
  project_next_click: {
    from_project_slug?: string;
    next_project_slug: string;
  };
  service_view: {
    service_slug: string;
    service_name?: string;
  };
  contact_start: {
    source?: string;
  };
  contact_submit: {
    project_type?: string;
    required_service?: string;
    timeline?: string;
  };
  whatsapp_click: {
    placement?: string;
  };
  email_click: {
    placement?: string;
  };
  instagram_click: {
    placement?: string;
  };
}

/** Disallowed property keys to guard against accidental PII leakage. */
export const DISALLOWED_PII_KEYS = new Set([
  "name",
  "email",
  "phone",
  "tel",
  "telephone",
  "whatsapp",
  "budget",
  "budget_range",
  "budgetrange",
  "brief",
  "project_brief",
  "projectbrief",
  "notes",
  "admin_notes",
  "message",
  "address",
  "company",
]);
