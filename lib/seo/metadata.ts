import type { Metadata } from "next";

import { getPublicMediaAssetsByIds } from "@/lib/data/media";
import { getPublishedPageWithSections } from "@/lib/data/pages";
import { getPublishedProjectBySlug } from "@/lib/data/projects";
import { getPublicSiteSettings } from "@/lib/data/site";
import { absoluteUrl, getSiteBaseUrl, resolveAbsoluteMediaUrl } from "./site-url";

export interface SiteSeoDefaults {
  siteName: string;
  professionalRole: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  defaultOgImageUrl?: string;
}

export async function getSiteSeoDefaults(): Promise<SiteSeoDefaults> {
  try {
    const settings = await getPublicSiteSettings();
    let defaultOgImageUrl: string | undefined = undefined;

    if (settings.defaultOgMediaId) {
      try {
        const assets = await getPublicMediaAssetsByIds([settings.defaultOgMediaId]);
        if (assets.length > 0) {
          defaultOgImageUrl = resolveAbsoluteMediaUrl(assets[0]);
        }
      } catch {
        // Fall back gracefully if media query fails
      }
    }

    const siteName = settings.siteName || "Gabrielle Aurelia";
    const professionalRole = settings.professionalRole || "Interior Designer";
    const defaultSeoTitle = settings.defaultSeoTitle || `${siteName} — ${professionalRole}`;
    const defaultSeoDescription =
      settings.defaultSeoDescription ||
      `${siteName} is a minimalist interior designer and architectural studio based in ${settings.location || "Jakarta"}.`;

    return {
      siteName,
      professionalRole,
      defaultSeoTitle,
      defaultSeoDescription,
      defaultOgImageUrl,
    };
  } catch {
    return {
      siteName: "Gabrielle Aurelia",
      professionalRole: "Interior Designer",
      defaultSeoTitle: "Gabrielle Aurelia — Interior Designer",
      defaultSeoDescription: "Minimalist interior architecture and spatial curation.",
      defaultOgImageUrl: undefined,
    };
  }
}

/**
 * Builds the base Metadata object for the entire portfolio application.
 */
export async function generateRootMetadata(): Promise<Metadata> {
  const defaults = await getSiteSeoDefaults();
  const baseUrl = getSiteBaseUrl();

  const ogImages = defaults.defaultOgImageUrl
    ? [{ url: defaults.defaultOgImageUrl, width: 1200, height: 630, alt: defaults.siteName }]
    : [];

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: defaults.defaultSeoTitle,
      template: `%s | ${defaults.siteName}`,
    },
    description: defaults.defaultSeoDescription,
    openGraph: {
      type: "website",
      siteName: defaults.siteName,
      title: defaults.defaultSeoTitle,
      description: defaults.defaultSeoDescription,
      url: baseUrl,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: defaults.defaultSeoTitle,
      description: defaults.defaultSeoDescription,
      images: ogImages.map((img) => img.url),
    },
    alternates: {
      canonical: baseUrl,
    },
  };
}

/**
 * Generates database-driven metadata for standard public pages (e.g. home, about, services, process, explorations, contact).
 */
export async function generatePageMetadata(slug: string): Promise<Metadata> {
  const [defaults, pageData] = await Promise.all([
    getSiteSeoDefaults(),
    getPublishedPageWithSections(slug),
  ]);

  if (!pageData) {
    return {
      title: "Page Not Found",
      robots: { index: false, follow: false },
    };
  }

  const page = pageData.page;
  const pagePath = slug === "home" ? "/" : `/${slug}`;
  const canonicalUrl = absoluteUrl(pagePath);

  const title = page.seoTitle || (slug === "home" ? defaults.defaultSeoTitle : page.title);
  const description = page.seoDescription || defaults.defaultSeoDescription;

  let ogImageUrl = defaults.defaultOgImageUrl;
  if (page.ogMediaId) {
    const assets = await getPublicMediaAssetsByIds([page.ogMediaId]);
    if (assets.length > 0) {
      ogImageUrl = resolveAbsoluteMediaUrl(assets[0]);
    }
  }

  const ogImages = ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: title }] : [];

  return {
    title: slug === "home" ? { absolute: title } : title,
    description,
    openGraph: {
      type: "website",
      siteName: defaults.siteName,
      title,
      description,
      url: canonicalUrl,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

/**
 * Generates database-driven metadata for public project case studies.
 */
export async function generateProjectMetadata(slug: string): Promise<Metadata> {
  const [defaults, project] = await Promise.all([
    getSiteSeoDefaults(),
    getPublishedProjectBySlug(slug),
  ]);

  if (!project) {
    return {
      title: "Project Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = absoluteUrl(`/projects/${slug}`);
  const title = project.seoTitle || `${project.title} — ${project.projectType}`;
  const description = project.seoDescription || project.summary;

  const ogAsset = project.ogMedia || project.heroMedia;
  const ogImageUrl = ogAsset ? resolveAbsoluteMediaUrl(ogAsset) : defaults.defaultOgImageUrl;

  const ogImages = ogImageUrl
    ? [{ url: ogImageUrl, width: 1200, height: 630, alt: project.title }]
    : [];

  return {
    title,
    description,
    openGraph: {
      type: "article",
      siteName: defaults.siteName,
      title,
      description,
      url: canonicalUrl,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
