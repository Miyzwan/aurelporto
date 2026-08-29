import { BeforeAfter } from "@/components/projects/BeforeAfter";
import { EditorialGallery } from "@/components/projects/EditorialGallery";
import { MaterialPalette } from "@/components/projects/MaterialPalette";
import { PlanSequence } from "@/components/projects/PlanSequence";
import { ProjectCredits } from "@/components/projects/ProjectCredits";
import { ProjectNarrative } from "@/components/projects/ProjectNarrative";
import { Section } from "@/components/public/Section";
import {
  PROJECT_SECTION_LABEL,
  isNarrativeSectionType,
  isProjectSectionType,
  readBeforeAfter,
  readCredits,
  readGallery,
  readMaterialPalette,
  readNarrative,
  readPlanSequence,
} from "@/lib/content/project-section-registry";
import type { MediaAsset } from "@/types/content";
import type { ProjectSection } from "@/types/project-sections";

interface ProjectSectionRendererProps {
  sections: ProjectSection[];
}

function resolveMedia(ids: string[], media: Record<string, MediaAsset>): MediaAsset[] {
  return ids.map((id) => media[id]).filter((asset): asset is MediaAsset => Boolean(asset));
}

/**
 * An unrecognised section type is a content/deployment mismatch, not a visitor
 * error. In development it is rendered as a loud placeholder so it cannot be
 * missed; in production it is logged and skipped, because a live case study
 * must never fail to render over one bad row (FE-007).
 */
function UnknownSection({ section }: { section: ProjectSection }) {
  if (process.env.NODE_ENV === "production") {
    console.error(
      `[ProjectSectionRenderer] Unknown section_type "${section.sectionType}" ` +
        `(section ${section.id}, key "${section.sectionKey}") — skipped.`,
    );
    return null;
  }

  return (
    <Section tight>
      <p className="border-critical text-critical type-spec border-2 border-dashed p-6">
        Unknown project section type <strong>{section.sectionType}</strong> (key{" "}
        <strong>{section.sectionKey}</strong>). Add it to PROJECT_SECTION_TYPES and the renderer,
        or fix the row.
      </p>
    </Section>
  );
}

function renderSection(section: ProjectSection) {
  const { sectionType, title, content, media } = section;

  if (!isProjectSectionType(sectionType)) {
    return <UnknownSection section={section} />;
  }

  const heading = title?.trim() || PROJECT_SECTION_LABEL[sectionType] || null;

  if (isNarrativeSectionType(sectionType)) {
    const narrative = readNarrative(content);
    return (
      <ProjectNarrative
        title={heading}
        body={narrative.body}
        media={resolveMedia(narrative.mediaIds, media)}
      />
    );
  }

  switch (sectionType) {
    case "plan_sequence": {
      const plan = readPlanSequence(content);
      return <PlanSequence title={heading} intro={plan.intro} items={plan.items} media={media} />;
    }
    case "material_palette": {
      const palette = readMaterialPalette(content);
      return (
        <MaterialPalette title={heading} intro={palette.intro} items={palette.items} media={media} />
      );
    }
    case "before_after": {
      const beforeAfter = readBeforeAfter(content);
      if (beforeAfter.pairs.length === 0) return null;
      return (
        <Section eyebrow={heading} tight>
          {beforeAfter.intro.trim() ? (
            <p className="type-body container-reading mb-12">{beforeAfter.intro}</p>
          ) : null}
          <BeforeAfter pairs={beforeAfter.pairs} media={media} />
        </Section>
      );
    }
    case "gallery": {
      const gallery = readGallery(content);
      const assets = resolveMedia(gallery.mediaIds, media);
      if (assets.length === 0) return null;
      return (
        <Section eyebrow={heading} tight>
          {gallery.intro.trim() ? (
            <p className="type-body container-reading mb-12">{gallery.intro}</p>
          ) : null}
          <EditorialGallery media={assets} />
        </Section>
      );
    }
    case "credits": {
      const credits = readCredits(content);
      if (credits.items.length === 0) return null;
      return (
        <Section eyebrow={heading} tight>
          <ProjectCredits items={credits.items} />
        </Section>
      );
    }
    default:
      // Every remaining member of the union is narrative and handled above.
      // If this is reached, a type was added without a renderer.
      return <UnknownSection section={section} />;
  }
}

export function ProjectSectionRenderer({ sections }: ProjectSectionRendererProps) {
  const ordered = sections
    .filter((section) => section.isEnabled)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      {ordered.map((section) => (
        <div key={section.id}>{renderSection(section)}</div>
      ))}
    </>
  );
}
