import type { MediaAsset } from "@/types/content";

/**
 * Project section contract — mirrors master plan section 6 exactly.
 *
 * The type list is closed. Adding a member means updating the plan first, then
 * the Zod schema (INT-004), the registry, the renderer, and the admin editor.
 */
export const PROJECT_SECTION_TYPES = [
  "overview",
  "brief",
  "existing_condition",
  "challenge",
  "concept",
  "plan_sequence",
  "material_palette",
  "lighting_strategy",
  "custom_furniture",
  "visualization",
  "implementation",
  "before_after",
  "gallery",
  "outcome",
  "credits",
  "rich_text",
] as const;

export type ProjectSectionType = (typeof PROJECT_SECTION_TYPES)[number];

/** Section types that share the narrative body + media shape. */
export const NARRATIVE_SECTION_TYPES = [
  "overview",
  "brief",
  "existing_condition",
  "challenge",
  "concept",
  "lighting_strategy",
  "custom_furniture",
  "visualization",
  "implementation",
  "outcome",
  "rich_text",
] as const;

export type NarrativeSectionType = (typeof NARRATIVE_SECTION_TYPES)[number];

export interface NarrativeContent {
  body: string;
  mediaIds: string[];
}

export const PLAN_ITEM_TYPES = [
  "existing",
  "zoning",
  "layout",
  "furniture",
  "lighting",
  "ceiling",
  "custom",
] as const;

export type PlanItemType = (typeof PLAN_ITEM_TYPES)[number];

export interface PlanSequenceItem {
  title: string;
  type: PlanItemType;
  mediaId: string;
  caption: string;
}

export interface PlanSequenceContent {
  intro: string;
  items: PlanSequenceItem[];
}

export interface MaterialItem {
  name: string;
  application: string;
  description: string;
  mediaId: string;
}

export interface MaterialPaletteContent {
  intro: string;
  items: MaterialItem[];
}

export interface BeforeAfterPair {
  label: string;
  beforeMediaId: string;
  afterMediaId: string;
}

export interface BeforeAfterContent {
  intro: string;
  pairs: BeforeAfterPair[];
}

export interface GalleryContent {
  intro: string;
  mediaIds: string[];
}

export interface CreditItem {
  role: string;
  name: string;
  url: string;
}

export interface CreditsContent {
  items: CreditItem[];
}

/**
 * A section as the renderer receives it: the stored row plus the media assets
 * the repository layer already resolved from the ids in `content`.
 */
export interface ProjectSection {
  id: string;
  sectionKey: string;
  sectionType: string;
  title: string | null;
  content: unknown;
  sortOrder: number;
  isEnabled: boolean;
  /** Resolved `media_assets` rows, keyed by id. */
  media: Record<string, MediaAsset>;
}
