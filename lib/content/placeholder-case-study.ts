import { placeholderMaterialMedia, placeholderProjects } from "@/lib/content/placeholder-projects";
import type { MediaAsset } from "@/types/content";
import type { ProjectSection } from "@/types/project-sections";

/**
 * TEMPORARY case-study fixtures for FE-007. INT-007 replaces these with
 * `project_sections` rows plus their resolved media.
 *
 * Copy is drawn from CLIENT_CONTEXT sections 11–17 only. Nothing here claims a
 * commission, a built result, a floor area, or a location the source does not
 * state. There is no before_after fixture because no before/after material
 * exists in the source (CLIENT_CONTEXT section 22 permits the section only
 * when real material exists); the renderer is covered for it by unit tests.
 * There is no `overview` fixture either: ProjectFacts already prints the
 * project summary, and repeating it would read as a mistake.
 */

function mediaMap(assets: MediaAsset[]): Record<string, MediaAsset> {
  return Object.fromEntries(assets.map((asset) => [asset.id, asset]));
}

export function placeholderSectionsFor(slug: string): ProjectSection[] {
  const project = placeholderProjects.find((candidate) => candidate.slug === slug);
  if (!project) return [];

  const hero = project.heroMedia;
  const galleryMedia = [hero, ...placeholderMaterialMedia].filter((asset): asset is MediaAsset =>
    Boolean(asset),
  );

  return [
    {
      id: `${project.id}-concept`,
      sectionKey: "concept",
      sectionType: "concept",
      title: null,
      content: {
        body: "NEEDS_CONFIRMATION — the concept narrative is written from the portfolio PDF and has not been reviewed by the designer.",
        mediaIds: hero ? [hero.id] : [],
      },
      sortOrder: 0,
      isEnabled: true,
      media: hero ? mediaMap([hero]) : {},
    },
    {
      id: `${project.id}-material`,
      sectionKey: "material-palette",
      sectionType: "material_palette",
      title: null,
      content: {
        intro: "",
        items: placeholderMaterialMedia.map((asset, index) => ({
          name: ["Timber", "Stone", "Textile"][index] ?? "Material",
          application: "",
          description: "",
          mediaId: asset.id,
        })),
      },
      sortOrder: 1,
      isEnabled: true,
      media: mediaMap(placeholderMaterialMedia),
    },
    {
      id: `${project.id}-gallery`,
      sectionKey: "gallery",
      sectionType: "gallery",
      title: null,
      content: { intro: "", mediaIds: galleryMedia.map((asset) => asset.id) },
      sortOrder: 2,
      isEnabled: true,
      media: mediaMap(galleryMedia),
    },
  ];
}
