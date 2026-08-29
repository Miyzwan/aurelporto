import Link from "next/link";

import { Section } from "@/components/public/Section";
import type { ServiceSummary, ServicesPreviewContent } from "@/types/content";

interface ServicesPreviewProps {
  content: ServicesPreviewContent;
  services: ServiceSummary[];
}

export function ServicesPreview({ content, services }: ServicesPreviewProps) {
  const visible = services.slice(0, Math.max(content.maxItems, 0));
  if (visible.length === 0) return null;

  const intro = content.intro.trim();

  return (
    <Section eyebrow={content.title}>
      {intro ? (
        <p className="type-body text-foreground-muted container-reading mb-12">{intro}</p>
      ) : null}

      <ul className="border-line border-t">
        {visible.map((service) => (
          <li key={service.id} className="border-line border-b">
            <Link
              href={`/services#${service.slug}`}
              className="grid-editorial hover:bg-surface items-baseline py-6 transition-colors duration-(--duration-quick)"
            >
              <h3 className="font-display desktop:col-span-4 col-span-12 text-2xl tracking-tight">
                {service.name}
              </h3>
              <p className="type-spec text-foreground-muted desktop:col-span-7 desktop:col-start-6 desktop:mt-0 col-span-12 mt-2">
                {service.shortDescription}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}
