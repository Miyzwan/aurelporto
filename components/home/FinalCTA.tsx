import Link from "next/link";

import { Section } from "@/components/public/Section";
import type { CtaContent } from "@/types/content";

interface FinalCTAProps {
  content: CtaContent;
}

/**
 * Static and always visible. FE-010 may add a reveal, but the CTA must never
 * depend on animation to be reachable (master plan constraint 25).
 */
export function FinalCTA({ content }: FinalCTAProps) {
  const body = content.body.trim();

  return (
    <Section eyebrow={content.eyebrow} className="border-line border-t">
      <div className="grid-editorial items-end">
        <div className="desktop:col-span-8 col-span-12">
          <h2 className="type-heading">{content.title}</h2>
          {body ? (
            <p className="type-body text-foreground-muted container-reading mt-6">{body}</p>
          ) : null}
        </div>
        <div className="desktop:col-span-4 desktop:mt-0 col-span-12 mt-8">
          <Link
            href={content.ctaHref}
            className="border-line-strong type-meta hover:bg-ink hover:text-warm-white inline-flex items-center border px-8 py-4 transition-colors duration-(--duration-quick)"
          >
            {content.ctaLabel}
          </Link>
        </div>
      </div>
    </Section>
  );
}
