import { Credibility } from "@/components/home/Credibility";
import { FinalCTA } from "@/components/home/FinalCTA";
import { MaterialMoment } from "@/components/home/MaterialMoment";
import { Philosophy } from "@/components/home/Philosophy";
import { Positioning } from "@/components/home/Positioning";
import { EditorialGallery } from "@/components/projects/EditorialGallery";
import { Section } from "@/components/public/Section";
import type {
  CtaContent,
  CredibilityContent,
  GalleryContent,
  MaterialMomentContent,
  PhilosophyContent,
  PositioningContent,
  RichTextContent,
} from "@/types/content";
import type { ResolvedPublicPageSection } from "@/lib/content/public-pages";

function contentOf<T>(section: ResolvedPublicPageSection): T {
  return section.section.content as T;
}

function renderSection(section: ResolvedPublicPageSection) {
  switch (section.section.sectionType) {
    case "positioning":
      return <Positioning content={contentOf<PositioningContent>(section)} />;
    case "philosophy":
      return <Philosophy content={contentOf<PhilosophyContent>(section)} />;
    case "material_moment":
      return (
        <MaterialMoment
          content={contentOf<MaterialMomentContent>(section)}
          media={section.media}
        />
      );
    case "rich_text": {
      const content = contentOf<RichTextContent>(section);
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
      const content = contentOf<GalleryContent>(section);
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
    case "cta":
      return <FinalCTA content={contentOf<CtaContent>(section)} />;
    case "credibility":
      return (
        <Credibility
          content={contentOf<CredibilityContent>(section)}
          testimonials={section.testimonials || []}
        />
      );
    default:
      return null;
  }
}

export function PublicPageSectionRenderer({
  sections,
}: {
  sections: ResolvedPublicPageSection[];
}) {
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
