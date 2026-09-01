import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { getPublicNavigation, getPublicSiteSettings } from "@/lib/data/site";
import { RepositoryError } from "@/lib/data/errors";
import { placeholderSiteSettings } from "@/lib/content/placeholder-shell";
import type { CallToAction, NavigationItem, SiteSettings } from "@/types/content";

const CONTACT_HREF = "/contact";

export interface PublicShellData {
  siteSettings: SiteSettings;
  headerNavigation: NavigationItem[];
  footerNavigation: NavigationItem[];
  socialNavigation: NavigationItem[];
  cta: CallToAction | null;
}

async function getSiteSettingsWithFallback(): Promise<SiteSettings> {
  try {
    return await getPublicSiteSettings();
  } catch (error) {
    if (!(error instanceof RepositoryError) || error.code !== "not_found") {
      throw error;
    }

    console.error(
      "[public-shell] site_settings singleton is missing; using the safe shell fallback.",
      error,
    );
    return placeholderSiteSettings;
  }
}

function getContactCta(navigation: NavigationItem[]): NavigationItem | null {
  return (
    navigation.find((item) => item.placement === "header" && item.href === CONTACT_HREF) ??
    navigation.find((item) => item.placement === "footer" && item.href === CONTACT_HREF) ??
    null
  );
}

export async function getPublicShellData(): Promise<PublicShellData> {
  const [siteSettings, navigation] = await Promise.all([
    getSiteSettingsWithFallback(),
    getPublicNavigation(),
  ]);
  const ctaItem = getContactCta(navigation);

  return {
    siteSettings,
    headerNavigation: navigation.filter(
      (item) => item.placement === "header" && item.id !== ctaItem?.id,
    ),
    footerNavigation: navigation.filter((item) => item.placement === "footer"),
    socialNavigation: navigation.filter((item) => item.placement === "social"),
    cta: ctaItem
      ? {
          label: ctaItem.label,
          href: ctaItem.href,
          targetBlank: ctaItem.targetBlank,
        }
      : null,
  };
}

/** The shell a page falls back to when site settings and navigation cannot be read. */
export const PUBLIC_SHELL_FALLBACK: PublicShellData = {
  siteSettings: placeholderSiteSettings,
  headerNavigation: [],
  footerNavigation: [],
  socialNavigation: [],
  cta: null,
};

/**
 * Every public page renders through this shell, so a failed read has to be
 * handled in two different ways.
 *
 * At runtime, degrading to an empty shell keeps the site up. During `next build`
 * it must not: the public routes are prerendered, so a failed read would be
 * frozen into static HTML as a site with no navigation, and nothing afterwards
 * would reveal it. Failing the build is the only point where that is still
 * visible. This is exactly how a deployment shipped with an empty navbar.
 */
export async function getPublicShellDataWithFallback(): Promise<PublicShellData> {
  try {
    return await getPublicShellData();
  } catch (error) {
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
      // The host is a NEXT_PUBLIC_ value, so naming it is safe and it settles the
      // most common cause outright: a build pointed at the wrong Supabase project.
      const host = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "<unset>";

      throw new Error(
        "[public-shell] could not read site settings or navigation during the production build. " +
          `Refusing to prerender a portfolio with no navigation. Configured Supabase URL: ${host}. ` +
          "Verify the publishable key matches that project and that every migration has been applied. " +
          `Underlying failure: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }

    console.error("[public-shell] falling back to an empty shell:", error);
    return PUBLIC_SHELL_FALLBACK;
  }
}
