import Link from "next/link";

import type { NavigationItem, SiteSettings } from "@/types/content";

interface FooterProps {
  siteSettings: SiteSettings;
  navigation: NavigationItem[];
  socialNavigation?: NavigationItem[];
}

/**
 * Every contact block is conditional. The client has not confirmed which phone
 * number, email, or social account may be published (CLIENT_CONTEXT section 4),
 * so the footer must look intentional with all of them absent.
 */
export function Footer({ siteSettings, navigation, socialNavigation = [] }: FooterProps) {
  const items = navigation.filter((item) => item.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);
  const socialItems =
    socialNavigation.length > 0
      ? socialNavigation
          .filter((item) => item.isVisible)
          .sort((a, b) => a.sortOrder - b.sortOrder)
      : siteSettings.socialLinks.map((link, index) => ({
          id: `site-social-${link.href}`,
          label: link.label,
          href: link.href,
          placement: "social" as const,
          sortOrder: index,
          isVisible: true,
          // The legacy site_settings JSON shape contains only label and href;
          // social links are external by definition until navigation items
          // provide an explicit target_blank value.
          targetBlank: true,
        }));
  const hasContact = Boolean(siteSettings.email ?? siteSettings.phone ?? siteSettings.whatsapp);
  const hasSocial = socialItems.length > 0;

  return (
    <footer className="border-line mt-(--spacing-section) border-t">
      <div className="container-editorial py-(--spacing-section-tight)">
        <div className="grid-editorial">
          <div className="desktop:col-span-5 col-span-12">
            <p className="type-heading">{siteSettings.siteName}</p>
            <p className="type-meta text-foreground-subtle mt-3">
              {siteSettings.professionalRole}
            </p>
            {siteSettings.location ? (
              <p className="type-spec text-foreground-muted mt-6">{siteSettings.location}</p>
            ) : null}
          </div>

          {items.length > 0 ? (
            <nav
              aria-label="Footer"
              className="tablet:col-span-4 desktop:col-span-3 col-span-6 mt-12 desktop:mt-0"
            >
              <h2 className="type-meta text-foreground-subtle">Navigate</h2>
              <ul className="mt-4 flex flex-col gap-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      target={item.targetBlank ? "_blank" : undefined}
                      rel={item.targetBlank ? "noreferrer noopener" : undefined}
                      className="type-spec hover:text-foreground-muted transition-colors duration-(--duration-quick)"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {hasContact ? (
            <div className="tablet:col-span-4 desktop:col-span-2 col-span-6 mt-12 desktop:mt-0">
              <h2 className="type-meta text-foreground-subtle">Contact</h2>
              <ul className="mt-4 flex flex-col gap-2">
                {siteSettings.email ? (
                  <li>
                    <a href={`mailto:${siteSettings.email}`} className="type-spec break-all">
                      {siteSettings.email}
                    </a>
                  </li>
                ) : null}
                {siteSettings.phone ? (
                  <li>
                    <a href={`tel:${siteSettings.phone.replace(/\s+/g, "")}`} className="type-spec">
                      {siteSettings.phone}
                    </a>
                  </li>
                ) : null}
                {siteSettings.whatsapp ? (
                  <li>
                    <a
                      href={`https://wa.me/${siteSettings.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="type-spec"
                    >
                      WhatsApp
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {hasSocial ? (
            <div className="tablet:col-span-4 desktop:col-span-2 col-span-12 mt-12 desktop:mt-0">
              <h2 className="type-meta text-foreground-subtle">Elsewhere</h2>
              <ul className="mt-4 flex flex-col gap-2">
                {socialItems.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.href}
                      target={link.targetBlank ? "_blank" : undefined}
                      rel={link.targetBlank ? "noreferrer noopener" : undefined}
                      className="type-spec"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        {siteSettings.footerText ? (
          <p className="type-meta text-foreground-subtle mt-(--spacing-section-tight)">
            {siteSettings.footerText}
          </p>
        ) : null}
      </div>
    </footer>
  );
}
