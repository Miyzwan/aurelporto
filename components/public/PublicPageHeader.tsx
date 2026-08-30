import { Section } from "@/components/public/Section";
import type { Page } from "@/types/content";

export function PublicPageHeader({ page }: { page: Page }) {
  const eyebrow = page.navLabel?.trim() && page.navLabel.trim() !== page.title.trim()
    ? page.navLabel
    : null;

  return (
    <Section eyebrow={eyebrow}>
      <h1 className="type-heading desktop:col-span-8 col-span-12">{page.title}</h1>
    </Section>
  );
}
