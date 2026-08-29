import { Credibility } from "@/components/home/Credibility";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Hero } from "@/components/home/Hero";
import { MaterialMoment } from "@/components/home/MaterialMoment";
import { Philosophy } from "@/components/home/Philosophy";
import { ProcessPreview } from "@/components/home/ProcessPreview";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { Positioning } from "@/components/home/Positioning";
import {
  placeholderCredibilityContent,
  placeholderCtaContent,
  placeholderFeaturedProjectsContent,
  placeholderHeroContent,
  placeholderMaterialMomentContent,
  placeholderPhilosophyContent,
  placeholderPositioningContent,
  placeholderProcessPreviewContent,
  placeholderProcessSteps,
  placeholderServices,
  placeholderServicesPreviewContent,
  placeholderTestimonials,
} from "@/lib/content/placeholder-home";
import {
  featuredProjects,
  placeholderMaterialMedia,
  placeholderProjects,
} from "@/lib/content/placeholder-projects";

/**
 * Section order follows the PRD section 14 scroll sequence:
 * hero, positioning, featured projects, philosophy, services, process,
 * material moment, credibility, CTA.
 *
 * INT-006 replaces the fixture imports with `page_sections` rows for the `home`
 * page and renders through the section registry; the component props stay as
 * they are.
 */
export default function HomePage() {
  const signature =
    placeholderProjects.find(
      (project) => project.id === placeholderHeroContent.signatureProjectId,
    ) ?? null;

  return (
    <>
      <Hero
        content={placeholderHeroContent}
        heroMedia={signature?.heroMedia ?? null}
        signatureProject={signature}
      />
      <Positioning content={placeholderPositioningContent} />
      <FeaturedProjects
        content={placeholderFeaturedProjectsContent}
        projects={featuredProjects()}
      />
      <Philosophy content={placeholderPhilosophyContent} />
      <ServicesPreview content={placeholderServicesPreviewContent} services={placeholderServices} />
      <ProcessPreview content={placeholderProcessPreviewContent} steps={placeholderProcessSteps} />
      <MaterialMoment content={placeholderMaterialMomentContent} media={placeholderMaterialMedia} />
      <Credibility content={placeholderCredibilityContent} testimonials={placeholderTestimonials} />
      <FinalCTA content={placeholderCtaContent} />
    </>
  );
}
