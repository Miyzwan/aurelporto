import Link from "next/link";

import { MobileMenu } from "@/components/public/MobileMenu";
import type { CallToAction, NavigationItem, SiteSettings } from "@/types/content";

interface HeaderProps {
  siteSettings: SiteSettings;
  navigation: NavigationItem[];
  cta?: CallToAction | null;
}

/**
 * The inline nav appears from 1280px up. Between 768px and 1279px the item
 * count plus the CTA crowds the bar, and PRD section 74 asks to reduce hover
 * dependency on tablet, so tablet keeps the tap-driven menu.
 */
export function Header({ siteSettings, navigation, cta }: HeaderProps) {
  const items = navigation.filter((item) => item.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <header className="border-line bg-canvas sticky top-0 z-40 border-b">
      <div className="container-editorial flex items-center justify-between gap-8 py-4">
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-display text-xl tracking-tight">{siteSettings.siteName}</span>
          <span className="type-meta text-foreground-subtle mt-1">
            {siteSettings.professionalRole}
          </span>
        </Link>

        <nav aria-label="Main" className="desktop:block hidden">
          <ul className="flex items-center gap-8">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  target={item.targetBlank ? "_blank" : undefined}
                  rel={item.targetBlank ? "noreferrer noopener" : undefined}
                  className="type-meta hover:text-foreground-muted transition-colors duration-(--duration-quick)"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {cta ? (
              <li>
                <Link
                  href={cta.href}
                  className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex items-center border px-5 py-2.5 transition-colors duration-(--duration-quick)"
                >
                  {cta.label}
                </Link>
              </li>
            ) : null}
          </ul>
        </nav>

        <MobileMenu items={items} cta={cta} siteName={siteSettings.siteName} />
      </div>
    </header>
  );
}
