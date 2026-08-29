import type {
  CredibilityContent,
  CtaContent,
  FeaturedProjectsContent,
  HomeHeroContent,
  MaterialMomentContent,
  PhilosophyContent,
  PositioningContent,
  ProcessPreviewContent,
  ProcessStep,
  ServiceSummary,
  ServicesPreviewContent,
  Testimonial,
} from "@/types/content";

/**
 * TEMPORARY home content for FE-005. INT-006 replaces every export here with
 * `page_sections` rows for the `home` page.
 *
 * All copy is derived from CLIENT_CONTEXT and creates no new factual claim
 * (Rule 5). Specifically:
 *  - The CTA is neutral. CLIENT_CONTEXT section 32 rules out "Start a Project"
 *    until the client confirms she takes client commissions, and section 28
 *    leaves her internship status unresolved, so the copy claims neither.
 *  - "Services" is titled Design Focus: section 20 documents focus areas, not
 *    a commercial service offering.
 *  - Process steps describe the design approach her portfolio demonstrates
 *    (section 34), not a client engagement process, which is undocumented.
 *  - Testimonials are empty by design — none exist in the source.
 */

export const placeholderHeroContent: HomeHeroContent = {
  eyebrow: "Interior Designer & Spatial Visualizer",
  headline: "Designing spaces through concept, material, function, and visual storytelling.",
  subheadline:
    "Interior design work across hospitality, retail, workplace, and furniture — from spatial concept and planning through to interior visualization.",
  location: "",
  heroMediaId: "m-batavia",
  signatureProjectId: "p-batavia",
  primaryCtaLabel: "View Projects",
  primaryCtaHref: "/projects",
  secondaryCtaLabel: "About",
  secondaryCtaHref: "/about",
};

export const placeholderPositioningContent: PositioningContent = {
  eyebrow: "",
  lines: ["SPACES BUILT FROM", "CONCEPT, MATERIAL,", "AND SPATIAL STORY."],
  body: "Each project starts from a clear idea about how a space should be entered, moved through, and remembered.",
};

export const placeholderFeaturedProjectsContent: FeaturedProjectsContent = {
  title: "Selected Projects",
  intro: "",
  maxItems: 5,
};

export const placeholderPhilosophyContent: PhilosophyContent = {
  title: "Approach",
  intro: "",
  items: [
    {
      title: "Concept",
      body: "A spatial idea comes first — context, brand, or history gives the plan something to argue.",
    },
    {
      title: "Space",
      body: "Zoning and circulation are resolved on the plan before the space is dressed.",
    },
    {
      title: "Material",
      body: "Material and colour carry the concept into something you can touch and light.",
    },
    {
      title: "Visualization",
      body: "3D modelling and rendering test the result and make the intent legible to others.",
    },
  ],
};

export const placeholderServicesPreviewContent: ServicesPreviewContent = {
  title: "Design Focus",
  intro: "",
  maxItems: 6,
};

export const placeholderServices: ServiceSummary[] = [
  {
    id: "s-hospitality",
    slug: "hospitality",
    name: "Hospitality",
    shortDescription: "Spatial experience, atmosphere, storytelling, and visualization.",
    media: null,
    sortOrder: 0,
  },
  {
    id: "s-retail",
    slug: "retail",
    name: "Retail",
    shortDescription: "Brand-driven space, material direction, and spatial presentation.",
    media: null,
    sortOrder: 1,
  },
  {
    id: "s-workplace",
    slug: "workplace",
    name: "Workplace",
    shortDescription: "Layout, flexibility, identity, and the experience of working in a space.",
    media: null,
    sortOrder: 2,
  },
  {
    id: "s-furniture",
    slug: "furniture",
    name: "Furniture",
    shortDescription: "Form, function, compact-space problem solving, and joinery.",
    media: null,
    sortOrder: 3,
  },
];

export const placeholderProcessPreviewContent: ProcessPreviewContent = {
  title: "How the Work Develops",
  intro: "",
  maxItems: 10,
};

export const placeholderProcessSteps: ProcessStep[] = [
  {
    id: "ps-1",
    stepNo: 1,
    title: "Brief & Context",
    description: "Read the brief, the user, and the context the space has to answer to.",
    media: null,
    sortOrder: 0,
  },
  {
    id: "ps-2",
    stepNo: 2,
    title: "Concept",
    description: "Set a spatial idea the rest of the decisions can be measured against.",
    media: null,
    sortOrder: 1,
  },
  {
    id: "ps-3",
    stepNo: 3,
    title: "Spatial Planning",
    description: "Resolve zoning, circulation, and furniture layout on plan and in section.",
    media: null,
    sortOrder: 2,
  },
  {
    id: "ps-4",
    stepNo: 4,
    title: "Material & Detail",
    description: "Choose material, colour, and lighting, then detail what has to be built.",
    media: null,
    sortOrder: 3,
  },
  {
    id: "ps-5",
    stepNo: 5,
    title: "Visualization",
    description: "Model and render the space, and lay the drawings out for presentation.",
    media: null,
    sortOrder: 4,
  },
];

export const placeholderMaterialMomentContent: MaterialMomentContent = {
  title: "Material Studies",
  intro: "",
  mediaIds: ["mm-1", "mm-2", "mm-3"],
};

export const placeholderCredibilityContent: CredibilityContent = {
  title: "Background",
  // Every figure below is stated in CLIENT_CONTEXT sections 5 and 9.
  stats: [
    { value: "3.72", label: "GPA, BINUS University" },
    { value: "B.Des", label: "Bachelor of Interior Design" },
    { value: "7", label: "Portfolio projects" },
    { value: "4", label: "Design focus areas" },
  ],
  testimonialIds: [],
};

/** No testimonial exists in the source. The section removes itself. */
export const placeholderTestimonials: Testimonial[] = [];

export const placeholderCtaContent: CtaContent = {
  eyebrow: "",
  title: "Get in touch.",
  body: "",
  ctaLabel: "Contact",
  ctaHref: "/contact",
};
