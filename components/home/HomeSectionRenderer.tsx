import { Section } from "@/components/public/Section";
import { EditorialGallery } from "@/components/projects/EditorialGallery";
import { Credibility } from "@/components/home/Credibility";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { FinalCTA } from "@/components/home/FinalCTA";
import { Hero } from "@/components/home/Hero";
import { MaterialMoment } from "@/components/home/MaterialMoment";
import { Philosophy } from "@/components/home/Philosophy";
import { Positioning } from "@/components/home/Positioning";
import { ProcessPreview } from "@/components/home/ProcessPreview";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { getSectionDefinition } from "@/lib/content/section-registry";
import type {
  CtaContent,
  CredibilityContent,
  FeaturedProjectsContent,
  GalleryContent,
  HomeHeroContent,
  MaterialMomentContent,
  PhilosophyContent,
  PositioningContent,
  RichTextContent,
  ServicesPreviewContent,
  ProcessPreviewContent,
} from "@/types/content";
import type { ResolvedHomeSection } from "@/lib/content/home-sections";

function UnknownHomeSection({ section }: { section: ResolvedHomeSection }) {
  if (process.env.NODE_ENV === "production") {
    console.error(
      `[HomeSectionRenderer] Unknown renderer for section_type "${section.section.sectionType}" ` +
        `(section ${section.section.id}, key "${section.section.sectionKey}") — skipped.`,
    );
    return null;
  }

  return (
    <Section tight>
      <p className="border-critical text-critical type-spec border-2 border-dashed p-6">
        Unknown home section type <strong>{section.section.sectionType}</strong> (key{" "}
        <strong>{section.section.sectionKey}</strong>).
      </p>
    </Section>
  );
}

function renderSection(section: ResolvedHomeSection) {
  const definition = getSectionDefinition(section.section.sectionType);
  if (!definition) return <UnknownHomeSection section={section} />;

  switch (definition.rendererKey) {
    case "home-hero":
      return (
        <Hero
          content={section.section.content as HomeHeroContent}
          heroMedia={section.heroMedia}
          signatureProject={section.signatureProject}
        />
      );
    case "positioning":
      return <Positioning content={section.section.content as PositioningContent} />;
    case "featured-projects":
      return (
        <FeaturedProjects
          content={section.section.content as FeaturedProjectsContent}
          projects={section.featuredProjects}
        />
      );
    case "philosophy":
      return <Philosophy content={section.section.content as PhilosophyContent} />;
    case "services-preview":
      return (
        <ServicesPreview
          content={section.section.content as ServicesPreviewContent}
          services={section.services}
        />
      );
    case "process-preview":
      return (
        <ProcessPreview
          content={section.section.content as ProcessPreviewContent}
          steps={section.processSteps}
        />
      );
    case "material-moment":
      return (
        <MaterialMoment
          content={section.section.content as MaterialMomentContent}
          media={section.media}
        />
      );
    case "credibility":
      return (
        <Credibility
          content={section.section.content as CredibilityContent}
          testimonials={section.testimonials}
        />
      );
    case "cta":
      return <FinalCTA content={section.section.content as CtaContent} />;
    case "rich-text": {
      const content = section.section.content as RichTextContent;
      if (!content.title.trim() && !content.body.trim()) return null;

      return (
        <Section eyebrow={content.title}>
          {content.body.trim() ? (
            <p className="type-body text-foreground-muted container-reading">{content.body}</p>
          ) : null}
        </Section>
      );
    }
    case "gallery": {
      const content = section.section.content as GalleryContent;
      if (section.media.length === 0) return null;

      return (
        <Section eyebrow={content.title} tight>
          {content.intro.trim() ? (
            <p className="type-body text-foreground-muted container-reading mb-12">
              {content.intro}
            </p>
          ) : null}
          <EditorialGallery media={section.media} />
        </Section>
      );
    }
    default:
      return <UnknownHomeSection section={section} />;
  }
}

export function HomeSectionRenderer({ sections }: { sections: ResolvedHomeSection[] }) {
  const ordered = [...sections]
    .filter((section) => section.section.isEnabled && section.section.status === "published")
    .sort(
      (a, b) =>
        a.section.sortOrder - b.section.sortOrder || a.section.id.localeCompare(b.section.id),
    );

  return (
    <>
      {ordered.map((section) => (
        <div key={section.section.id}>{renderSection(section)}</div>
      ))}
    </>
  );
}
