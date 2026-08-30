import { ReducedMotionProvider, SmoothScrollProvider } from "@/components/motion";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { getPublicShellData } from "@/lib/content/public-shell";

/**
 * Public content is read at request time so changes to site settings and
 * navigation are visible without a rebuild. Admin routes use the same rule
 * because their server-side session also requires dynamic rendering.
 */
export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const { siteSettings, headerNavigation, footerNavigation, socialNavigation, cta } =
    await getPublicShellData();

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
        </>
      </SmoothScrollProvider>
    </ReducedMotionProvider>
  );
}
