import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import {
  placeholderFooterNavigation,
  placeholderHeaderCta,
  placeholderHeaderNavigation,
  placeholderSiteSettings,
} from "@/lib/content/placeholder-shell";

/**
 * INT-005 swaps the placeholder fixtures below for Supabase reads of
 * `site_settings` and `navigation_items`. The component contracts stay the same.
 */
export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <a
        href="#main-content"
        className="bg-canvas type-meta focus:ring-focus sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-5 focus:py-3"
      >
        Skip to content
      </a>

      <Header
        siteSettings={placeholderSiteSettings}
        navigation={placeholderHeaderNavigation}
        cta={placeholderHeaderCta}
      />

      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>

      <Footer siteSettings={placeholderSiteSettings} navigation={placeholderFooterNavigation} />
    </>
  );
}
