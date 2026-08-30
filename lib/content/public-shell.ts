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
