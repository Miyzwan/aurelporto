import type {
  BeforeAfterContent,
  CreditsContent,
  GalleryContent,
  MaterialPaletteContent,
  NarrativeContent,
  PlanSequenceContent,
  ProjectSectionContent,
  ProjectSectionType,
} from "@/types/project-sections";
import { NARRATIVE_SECTION_TYPES, PROJECT_SECTION_TYPES } from "@/types/project-sections";
import type { ZodType } from "zod";

import {
  beforeAfterSchema,
  creditsSchema,
  materialPaletteSchema,
  narrativeSchema,
  parseProjectSectionContent,
  planSequenceSchema,
  projectGallerySchema,
  projectSectionContentSchemas,
} from "@/lib/validation/project-sections";

const PROJECT_SECTION_TYPE_SET = new Set<string>(PROJECT_SECTION_TYPES);
const NARRATIVE_SECTION_TYPE_SET = new Set<string>(NARRATIVE_SECTION_TYPES);

export interface ProjectSectionDefinition {
  sectionType: ProjectSectionType;
  schema: ZodType;
  editorKey: string;
  rendererKey: string;
}

export const PROJECT_SECTION_REGISTRY = {
  overview: {
    sectionType: "overview",
    schema: narrativeSchema,
    editorKey: "narrative",
    rendererKey: "narrative",
  },
  brief: {
    sectionType: "brief",
    schema: narrativeSchema,
    editorKey: "narrative",
    rendererKey: "narrative",
  },
  existing_condition: {
    sectionType: "existing_condition",
    schema: narrativeSchema,
    editorKey: "narrative",
    rendererKey: "narrative",
  },
  challenge: {
    sectionType: "challenge",
    schema: narrativeSchema,
    editorKey: "narrative",
    rendererKey: "narrative",
  },
  concept: {
    sectionType: "concept",
    schema: narrativeSchema,
    editorKey: "narrative",
    rendererKey: "narrative",
  },
  plan_sequence: {
    sectionType: "plan_sequence",
    schema: planSequenceSchema,
    editorKey: "plan-sequence",
    rendererKey: "plan-sequence",
  },
  material_palette: {
    sectionType: "material_palette",
    schema: materialPaletteSchema,
    editorKey: "material-palette",
    rendererKey: "material-palette",
  },
  lighting_strategy: {
    sectionType: "lighting_strategy",
    schema: narrativeSchema,
    editorKey: "narrative",
    rendererKey: "narrative",
  },
  custom_furniture: {
    sectionType: "custom_furniture",
    schema: narrativeSchema,
    editorKey: "narrative",
    rendererKey: "narrative",
  },
  visualization: {
    sectionType: "visualization",
    schema: narrativeSchema,
    editorKey: "narrative",
    rendererKey: "narrative",
  },
  implementation: {
    sectionType: "implementation",
    schema: narrativeSchema,
    editorKey: "narrative",
    rendererKey: "narrative",
  },
  before_after: {
    sectionType: "before_after",
    schema: beforeAfterSchema,
    editorKey: "before-after",
    rendererKey: "before-after",
  },
  gallery: {
    sectionType: "gallery",
    schema: projectGallerySchema,
    editorKey: "gallery",
    rendererKey: "gallery",
  },
  outcome: {
    sectionType: "outcome",
    schema: narrativeSchema,
    editorKey: "narrative",
    rendererKey: "narrative",
  },
  credits: {
    sectionType: "credits",
    schema: creditsSchema,
    editorKey: "credits",
    rendererKey: "credits",
  },
  rich_text: {
    sectionType: "rich_text",
    schema: narrativeSchema,
    editorKey: "narrative",
    rendererKey: "narrative",
  },
} as const satisfies Record<ProjectSectionType, ProjectSectionDefinition>;

export const projectSectionRegistry = PROJECT_SECTION_REGISTRY;

export function getProjectSectionDefinition(
  sectionType: string,
): ProjectSectionDefinition | undefined {
  return isProjectSectionType(sectionType) ? PROJECT_SECTION_REGISTRY[sectionType] : undefined;
}

export function parseRegisteredProjectSectionContent(
  sectionType: string,
  content: unknown,
  recordId: string,
): ProjectSectionContent | undefined {
  return getProjectSectionDefinition(sectionType)
    ? parseProjectSectionContent(sectionType, content, recordId)
    : undefined;
}

export { projectSectionContentSchemas };

export function isProjectSectionType(value: string): value is ProjectSectionType {
  return PROJECT_SECTION_TYPE_SET.has(value);
}

export function isNarrativeSectionType(value: string): boolean {
  return NARRATIVE_SECTION_TYPE_SET.has(value);
}

/**
 * Default heading for a section that has no admin-supplied title.
 *
 * These are UI labels, not CMS content, so master plan constraint 20 allows
 * them in source.
 */
export const PROJECT_SECTION_LABEL: Record<ProjectSectionType, string> = {
  overview: "Overview",
  brief: "Brief",
  existing_condition: "Existing condition",
  challenge: "Challenge",
  concept: "Concept",
  plan_sequence: "Spatial planning",
  material_palette: "Material palette",
  lighting_strategy: "Lighting",
  custom_furniture: "Custom furniture",
  visualization: "Visualization",
  implementation: "Implementation",
  before_after: "Before and after",
  gallery: "Gallery",
  outcome: "Outcome",
  credits: "Credits",
  rich_text: "",
};

/* --------------------------------------------------------------------------
   Defensive readers.

   `content` is jsonb: a row written by an older admin build, or hand-edited in
   the database, can be missing keys or hold the wrong type. INT-004 validates
   on write with Zod; these keep a malformed row from throwing on read.
-------------------------------------------------------------------------- */

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function readNarrative(content: unknown): NarrativeContent {
  const record = asRecord(content);
  return { body: asString(record.body), mediaIds: asStringArray(record.mediaIds) };
}

export function readPlanSequence(content: unknown): PlanSequenceContent {
  const record = asRecord(content);
  return {
    intro: asString(record.intro),
    items: asArray(record.items).map((raw) => {
      const item = asRecord(raw);
      return {
        title: asString(item.title),
        type: asString(item.type) as PlanSequenceContent["items"][number]["type"],
        mediaId: asString(item.mediaId),
        caption: asString(item.caption),
      };
    }),
  };
}

export function readMaterialPalette(content: unknown): MaterialPaletteContent {
  const record = asRecord(content);
  return {
    intro: asString(record.intro),
    items: asArray(record.items).map((raw) => {
      const item = asRecord(raw);
      return {
        name: asString(item.name),
        application: asString(item.application),
        description: asString(item.description),
        mediaId: asString(item.mediaId),
      };
    }),
  };
}

export function readBeforeAfter(content: unknown): BeforeAfterContent {
  const record = asRecord(content);
  return {
    intro: asString(record.intro),
    pairs: asArray(record.pairs).map((raw) => {
      const pair = asRecord(raw);
      return {
        label: asString(pair.label),
        beforeMediaId: asString(pair.beforeMediaId),
        afterMediaId: asString(pair.afterMediaId),
      };
    }),
  };
}

export function readGallery(content: unknown): GalleryContent {
  const record = asRecord(content);
  return { intro: asString(record.intro), mediaIds: asStringArray(record.mediaIds) };
}

export function readCredits(content: unknown): CreditsContent {
  const record = asRecord(content);
  return {
    items: asArray(record.items).map((raw) => {
      const item = asRecord(raw);
      return { role: asString(item.role), name: asString(item.name), url: asString(item.url) };
    }),
  };
}
