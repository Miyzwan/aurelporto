"use client";

import Link from "next/link";

import { HeroSpaceReveal, MaskReveal } from "@/components/motion";
import { Media } from "@/components/public/Media";
import { trackPortfolioEvent } from "@/lib/analytics/tracker";
import type { HomeHeroContent, MediaAsset, ProjectSummary } from "@/types/content";

interface HeroProps {
  content: HomeHeroContent;
  heroMedia: MediaAsset | null;
  signatureProject: ProjectSummary | null;
}

/**
 * Answers "who, what kind of work, and what is the signature project" inside
 * one viewport (PRD section 16). Motion is layered on top of markup that must
 * already be complete and readable with JavaScript disabled.
 */
export function Hero({ content, heroMedia, signatureProject }: HeroProps) {
  const eyebrow = content.eyebrow.trim();
  const subheadline = content.subheadline.trim();
  const location = content.location.trim();

  function handlePrimaryCtaClick() {
    if (content.primaryCtaHref.includes("project")) {
      trackPortfolioEvent("hero_view_projects_click", { placement: "hero_primary" });
    } else {
      trackPortfolioEvent("hero_start_project_click", { placement: "hero_primary" });
    }
  }

  function handleSecondaryCtaClick() {
    if (content.secondaryCtaHref?.includes("contact")) {
      trackPortfolioEvent("hero_start_project_click", { placement: "hero_secondary" });
    } else {
      trackPortfolioEvent("hero_view_projects_click", { placement: "hero_secondary" });
    }
  }

  return (
    <section className="container-editorial pt-(--spacing-section-tight) pb-(--spacing-section)">
      <div className="grid-editorial">
        <div className="desktop:col-span-9 col-span-12">
          {eyebrow ? <p className="type-meta text-foreground-subtle">{eyebrow}</p> : null}
          <h1 className="type-statement mt-6">
            <MaskReveal as="span" contentClassName="block">
              {content.headline}
            </MaskReveal>
          </h1>
          {subheadline ? (
            <p className="type-body text-foreground-muted container-reading mt-8">{subheadline}</p>
          ) : null}
        </div>

        <div className="desktop:col-span-3 desktop:mt-0 desktop:self-end col-span-12 mt-8">
          <div className="flex flex-wrap gap-3">
            <Link
              href={content.primaryCtaHref}
              onClick={handlePrimaryCtaClick}
              className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex items-center border px-6 py-3 transition-colors duration-(--duration-quick)"
            >
              {content.primaryCtaLabel}
            </Link>
            {content.secondaryCtaLabel ? (
              <Link
                href={content.secondaryCtaHref}
                onClick={handleSecondaryCtaClick}
                className="type-meta hover:text-foreground-muted inline-flex items-center px-2 py-3 underline underline-offset-8 transition-colors duration-(--duration-quick)"
              >
                {content.secondaryCtaLabel}
              </Link>
            ) : null}
          </div>
          {location ? <p className="type-meta text-foreground-subtle mt-6">{location}</p> : null}
        </div>
      </div>

      {heroMedia ? (
        <div className="mt-12">
          <HeroSpaceReveal>
            <Media
              asset={heroMedia}
              aspectRatio={16 / 9}
              sizes="100vw"
              priority
              showCaption={false}
            />
          </HeroSpaceReveal>
        </div>
      ) : null}

      {signatureProject ? (
        <div className="rule-hairline mt-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 pt-4">
          <p className="type-meta text-foreground-subtle">Signature project</p>
          <p className="type-spec">
            <Link
              href={`/projects/${signatureProject.slug}`}
              onClick={() =>
                trackPortfolioEvent("featured_project_click", {
                  project_slug: signatureProject.slug,
                  project_type: signatureProject.projectType,
                  sort_order: 0,
                })
              }
              className="underline-offset-4 hover:underline"
            >
              {signatureProject.title}
            </Link>
            <span className="text-foreground-muted">
              {` — ${signatureProject.projectType}, ${signatureProject.year}`}
            </span>
          </p>
        </div>
      ) : null}
    </section>
  );
}
