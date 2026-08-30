import React from "react";

import type { ProjectDetail, SiteSettings } from "@/types/content";
import { absoluteUrl, getSiteBaseUrl, resolveAbsoluteMediaUrl } from "./site-url";

/**
 * Component to inject raw JSON-LD structured data into server-rendered pages.
 */
export function StructuredData({
  data,
}: {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

/**
 * Generates Schema.org Person & Organization metadata based purely on factual site settings.
 */
export function buildPersonOrOrganizationSchema(siteSettings: SiteSettings) {
  const baseUrl = getSiteBaseUrl();
  const sameAs = siteSettings.socialLinks?.map((link) => link.href).filter(Boolean) ?? [];

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteSettings.siteName,
    jobTitle: siteSettings.professionalRole,
    url: baseUrl,
    ...(siteSettings.email ? { email: siteSettings.email } : {}),
    ...(siteSettings.phone ? { telephone: siteSettings.phone } : {}),
    ...(siteSettings.location
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: siteSettings.location,
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

/**
 * Generates Schema.org WebSite metadata.
 */
export function buildWebSiteSchema(siteSettings: SiteSettings) {
  const baseUrl = getSiteBaseUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteSettings.siteName,
    url: baseUrl,
    description: siteSettings.defaultSeoDescription ?? undefined,
  };
}

/**
 * Generates Schema.org BreadcrumbList for hierarchical page discovery.
 */
export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Generates Schema.org CreativeWork metadata for design case studies.
 */
export function buildProjectSchema(project: ProjectDetail, siteSettings: SiteSettings) {
  const projectUrl = absoluteUrl(`/projects/${project.slug}`);
  const mediaAsset = project.heroMedia;
  const imageUrl = mediaAsset ? resolveAbsoluteMediaUrl(mediaAsset) : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.summary,
    url: projectUrl,
    genre: project.projectType,
    dateCreated: String(project.year),
    ...(imageUrl ? { image: imageUrl } : {}),
    author: {
      "@type": "Person",
      name: siteSettings.siteName,
      jobTitle: siteSettings.professionalRole,
    },
    ...(project.location
      ? {
          contentLocation: {
            "@type": "Place",
            name: project.location,
          },
        }
      : {}),
  };
}
