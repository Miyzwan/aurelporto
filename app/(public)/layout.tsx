import { PortfolioAnalytics } from "@/components/analytics/PortfolioAnalytics";
import { ReducedMotionProvider, SmoothScrollProvider } from "@/components/motion";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { getPublicShellDataWithFallback } from "@/lib/content/public-shell";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const { siteSettings, headerNavigation, footerNavigation, socialNavigation, cta } =
    await getPublicShellDataWithFallback();

  return (
    <ReducedMotionProvider>
      <SmoothScrollProvider>
        <>
          <a
            href="#main-content"
            className="bg-canvas type-meta focus:ring-focus sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-5 focus:py-3"
          >
            Skip to content
          </a>

          <Header siteSettings={siteSettings} navigation={headerNavigation} cta={cta} />

          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>

          <Footer
            siteSettings={siteSettings}
            navigation={footerNavigation}
            socialNavigation={socialNavigation}
          />

          <PortfolioAnalytics />
        </>
      </SmoothScrollProvider>
    </ReducedMotionProvider>
  );
}
