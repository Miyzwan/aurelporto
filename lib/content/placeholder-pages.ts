import { placeholderServices } from "@/lib/content/placeholder-home";
import type {
  EducationEntry,
  ExperienceEntry,
  ExplorationSummary,
  InquiryConfig,
  ServiceDetail,
  SoftwareCapability,
} from "@/types/content";

/**
 * TEMPORARY page content for FE-008. INT-008 replaces it with Supabase reads.
 *
 * Sourced from CLIENT_CONTEXT sections 3, 5, 6, 8, 18 and 20. Two deliberate
 * omissions:
 *  - No internship entry. Section 28 records a direct contradiction between the
 *    CV ("seeking an internship") and the portfolio ("2026 Internship at Byast
 *    Design Studio"), and the rule is not to publish both. NEEDS_CONFIRMATION.
 *  - No secondary-school history: section 5 says it should not dominate About.
 */

export const placeholderServiceDetails: ServiceDetail[] = placeholderServices.map((service) => ({
  ...service,
  fullDescription: null,
  idealClient: null,
  scope: [],
  deliverables: [],
  included: [],
  excluded: [],
  typicalProjectTypes: [],
}));

export const placeholderAboutIntro =
  "Gabrielle Aurelia Sulistya is an Interior Design student at BINUS University focused on hospitality interiors, spatial visualization, and concept-driven design. Her work explores how material, layout, visual storytelling, and spatial experience can be translated into clear design concepts and compelling interior visualizations.";

export const placeholderEducation: EducationEntry[] = [
  {
    institution: "BINUS University",
    qualification: "Bachelor of Interior Design",
    detail: "GPA 3.72",
    period: "August 2023 – July 2027",
  },
];

/**
 * A compact capability list, not star ratings — CLIENT_CONTEXT section 6
 * explicitly asks for this presentation.
 */
export const placeholderSoftware: SoftwareCapability[] = [
  { name: "AutoCAD", application: "Technical Drawing" },
  { name: "SketchUp", application: "3D Modeling" },
  { name: "D5 Render", application: "Visualization & Lighting" },
  { name: "LayOut", application: "Presentation Drawing" },
  { name: "Adobe InDesign", application: "Editorial Layout" },
  { name: "Canva", application: "Visual Presentation" },
];

export const placeholderExperience: ExperienceEntry[] = [
  {
    title: "Creative Division",
    organisation: "Pelatihan Desain Kreatif Inovatif",
    year: "2025",
    description:
      "Designed visual materials, event merchandise, and promotional posters, developing concepts aligned with the training theme and audience.",
  },
  {
    title: "Participant",
    organisation: "JIFFINA Youth Furniture Design Competition",
    year: "2025",
    description:
      "Developed furniture design concepts from a competition brief, working against industry standards and material constraints.",
  },
  {
    title: "Creative Division",
    organisation: "Company Visit to Jepara Furniture Industry",
    year: "2024",
    description:
      "Analysed furniture materials and production processes, and translated event concepts into merchandise, posters, banners, and live visual content.",
  },
  {
    title: "Event Division",
    organisation: "Innerside Interior Exhibition",
    year: "2024",
    description: "Ticketing, visitor coordination, and event operations under time pressure.",
  },
  {
    title: "Freshmen Partner B28",
    organisation: "BINUS First Year Program",
    year: "2024",
    description: "Assisted new students during orientation, coordinating across the cohort.",
  },
];

/** No exploration content exists in the source yet; the page shows its empty state. */
export const placeholderExplorations: ExplorationSummary[] = [];

/**
 * Option lists are scoped to the designer's documented focus areas rather than
 * the generic residential list in the master plan's example JSON, which
 * presumes a commercial practice CLIENT_CONTEXT section 2 does not support.
 * All of it is CMS-editable from INT-010.
 */
export const placeholderInquiryConfig: InquiryConfig = {
  projectTypes: ["Hospitality", "Retail", "Office", "Furniture", "Other"],
  projectStatuses: ["New Build", "Renovation", "Furnishing Only", "Still Exploring"],
  timelineOptions: ["Immediately", "1–3 Months", "3–6 Months", "6+ Months", "Flexible"],
  budgetOptions: [],
  showBudgetField: false,
  showPhoneField: true,
  successTitle: "Thank you",
  successBody: "Your project inquiry has been received.",
};
