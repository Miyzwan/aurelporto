import type { MediaAsset, ProjectSummary } from "@/types/content";

/**
 * TEMPORARY project fixtures for FE-005..FE-008. INT-007 replaces these with
 * Supabase reads; BE-012 seeds the real rows.
 *
 * Sourced strictly from CLIENT_CONTEXT sections 9–17:
 *  - Titles use the descriptive project-page headings, because the mapping
 *    between those and the Table of Contents names is still unconfirmed
 *    (CLIENT_CONTEXT section 28, inconsistency B).
 *  - `projectStatus` is "concept" for every entry. These are renders and
 *    academic work; Rule 3 forbids calling them built or completed.
 *  - `location` is empty and `areaSqm` is null wherever the source does not
 *    state them. The card drops empty facts rather than inventing them.
 *  - No brand named here was a commercial commission (Rule 2).
 *
 * NEEDS_CONFIRMATION: official titles, years, locations, areas, individual vs.
 * group contribution, and project_type for every entry.
 */

function fixtureImage(
  id: string,
  path: string,
  altText: string,
  size: [number, number],
): MediaAsset {
  return {
    id,
    bucket: "portfolio-public",
    storagePath: path,
    mediaType: "image",
    altText,
    caption: null,
    photographer: null,
    width: size[0],
    height: size[1],
    posterPath: null,
    mimeType: "image/png",
  };
}

export const placeholderProjects: ProjectSummary[] = [
  {
    id: "p-batavia",
    slug: "menavigasi-batavia",
    title: "Menavigasi Batavia",
    year: 2025,
    location: "Jakarta, Indonesia",
    projectType: "Hospitality",
    areaSqm: null,
    projectStatus: "concept",
    summary:
      "A boutique hotel concept that reads circulation as navigation, drawing on Jakarta local wisdom, the historic port at Sunda Kelapa, and a modern colonial material direction.",
    heroMedia: fixtureImage(
      "m-batavia",
      "/fixtures/hero.png",
      "Placeholder panel standing in for the Menavigasi Batavia reception render",
      [1600, 1000],
    ),
    featured: true,
    featuredOrder: 0,
    sortOrder: 0,
  },
  {
    id: "p-starbucks",
    slug: "starbucks-retail",
    title: "Starbucks Retail",
    year: 2024,
    location: "",
    projectType: "Retail",
    areaSqm: null,
    projectStatus: "concept",
    summary:
      "A brand-based retail study built around a calm, natural atmosphere: planting, wood and bamboo, and daylight carried deep into the plan.",
    heroMedia: fixtureImage(
      "m-starbucks",
      "/fixtures/project-1.png",
      "Placeholder panel standing in for the Starbucks retail interior render",
      [1200, 900],
    ),
    featured: true,
    featuredOrder: 1,
    sortOrder: 1,
  },
  {
    id: "p-accor",
    slug: "accor-office",
    title: "Accor Office",
    year: 2024,
    location: "",
    projectType: "Office",
    areaSqm: null,
    projectStatus: "concept",
    summary:
      "An open workplace concept combining Jakarta tradition with modernity — batik pattern and natural materials arranged to read as transparency.",
    heroMedia: fixtureImage(
      "m-accor",
      "/fixtures/project-2.png",
      "Placeholder panel standing in for the Accor office interior render",
      [1200, 1500],
    ),
    featured: true,
    featuredOrder: 2,
    sortOrder: 2,
  },
  {
    id: "p-netflix",
    slug: "netflix-office",
    title: "Netflix Office",
    year: 2024,
    location: "",
    projectType: "Office",
    areaSqm: null,
    projectStatus: "concept",
    summary:
      "A workplace study on creativity and flexibility: bright colour, an open layout, and a flexible spatial arrangement across front office, working space, and meeting room.",
    heroMedia: fixtureImage(
      "m-netflix",
      "/fixtures/project-3.png",
      "Placeholder panel standing in for the Netflix office interior render",
      [1200, 900],
    ),
    featured: true,
    featuredOrder: 3,
    sortOrder: 3,
  },
  {
    id: "p-computer-3d",
    slug: "computer-3d-retail",
    title: "Computer 3D Retail",
    year: 2024,
    location: "",
    projectType: "Retail",
    areaSqm: null,
    projectStatus: "concept",
    summary:
      "A visualization study crossing Japandi restraint with French decorative language — wood against blue and white, with Toile de Jouy as the connective motif.",
    heroMedia: fixtureImage(
      "m-computer-3d",
      "/fixtures/project-4.png",
      "Placeholder panel standing in for the Computer 3D retail interior render",
      [1200, 1500],
    ),
    featured: true,
    featuredOrder: 4,
    sortOrder: 4,
  },
  {
    id: "p-furniture-multifunctional",
    slug: "furniture-design-multifunctional",
    title: "Furniture Design II — Multifunctional",
    year: 2024,
    location: "",
    projectType: "Furniture",
    areaSqm: null,
    projectStatus: "concept",
    summary:
      "One object, several functions: a compact-living piece that answers limited space by supporting both eating and storage.",
    heroMedia: fixtureImage(
      "m-furniture-2",
      "/fixtures/material-1.png",
      "Placeholder panel standing in for the multifunctional furniture render",
      [900, 900],
    ),
    featured: false,
    featuredOrder: 0,
    sortOrder: 5,
  },
  {
    id: "p-furniture-stool",
    slug: "furniture-design-stool",
    title: "Furniture Design I — Stool",
    year: 2024,
    location: "",
    projectType: "Furniture",
    areaSqm: null,
    projectStatus: "concept",
    summary:
      "A stool taking its posture and colour from a flamingo, resolved through mortise-and-tenon joinery.",
    heroMedia: fixtureImage(
      "m-furniture-1",
      "/fixtures/material-2.png",
      "Placeholder panel standing in for the flamingo stool render",
      [900, 900],
    ),
    featured: false,
    featuredOrder: 0,
    sortOrder: 6,
  },
];

export const placeholderMaterialMedia: MediaAsset[] = [
  fixtureImage(
    "mm-1",
    "/fixtures/material-1.png",
    "Placeholder panel for a timber material study",
    [900, 900],
  ),
  fixtureImage(
    "mm-2",
    "/fixtures/material-2.png",
    "Placeholder panel for a stone material study",
    [900, 900],
  ),
  fixtureImage(
    "mm-3",
    "/fixtures/material-3.png",
    "Placeholder panel for a textile material study",
    [900, 900],
  ),
];

export function featuredProjects(): ProjectSummary[] {
  return placeholderProjects
    .filter((project) => project.featured)
    .sort((a, b) => a.featuredOrder - b.featuredOrder);
}
