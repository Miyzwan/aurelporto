"use client";

import { Media } from "@/components/public/Media";
import { trackPortfolioEvent } from "@/lib/analytics/tracker";
import type { ServiceDetail } from "@/types/content";

interface ServiceListProps {
  services: ServiceDetail[];
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6">
      <h3 className="type-meta text-foreground-subtle">{label}</h3>
      <ul className="mt-2 flex flex-col gap-1">
        {items.map((item) => (
          <li key={item} className="type-spec">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Every media and detail block is conditional, so a focus area with nothing but
 * a name and a sentence still reads as finished rather than half-filled.
 */
export function ServiceList({ services }: ServiceListProps) {
  if (services.length === 0) {
    return <p className="type-body text-foreground-muted">Details are being prepared.</p>;
  }

  return (
    <div className="border-line flex flex-col border-t">
      {services.map((service) => (
        <article
          key={service.id}
          id={service.slug}
          onClick={() =>
            trackPortfolioEvent("service_view", {
              service_slug: service.slug,
              service_name: service.name,
            })
          }
          className="border-line grid-editorial scroll-mt-24 border-b py-12"
        >
          <div className="desktop:col-span-4 col-span-12">
            <h2 className="font-display text-3xl tracking-tight">{service.name}</h2>
          </div>

          <div className="desktop:col-span-7 desktop:col-start-6 desktop:mt-0 col-span-12 mt-6">
            <p className="type-body">{service.shortDescription}</p>
            {service.fullDescription ? (
              <p className="type-body text-foreground-muted mt-6">{service.fullDescription}</p>
            ) : null}
            {service.idealClient ? (
              <p className="type-spec text-foreground-muted mt-6">{service.idealClient}</p>
            ) : null}

            <DetailList label="Scope" items={service.scope} />
            <DetailList label="Deliverables" items={service.deliverables} />
            <DetailList label="Included" items={service.included} />
            <DetailList label="Not included" items={service.excluded} />

            {service.media ? (
              <div className="mt-8">
                <Media
                  asset={service.media}
                  aspectRatio={16 / 9}
                  sizes="(min-width: 1280px) 55vw, 100vw"
                />
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
