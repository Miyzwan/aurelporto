import { Section } from "@/components/public/Section";
import type { CredibilityContent, Testimonial } from "@/types/content";

interface CredibilityProps {
  content: CredibilityContent;
  testimonials: Testimonial[];
}

/**
 * Disappears entirely when there are no confirmed stats or testimonials.
 *
 * CLIENT_CONTEXT sections 2 and 29 forbid manufacturing credibility figures, so
 * an empty state here is the correct output, not a gap to fill.
 */
export function Credibility({ content, testimonials }: CredibilityProps) {
  const stats = content.stats.filter((stat) => stat.value.trim() && stat.label.trim());
  const quotes = testimonials.filter((testimonial) => testimonial.quote.trim());

  if (stats.length === 0 && quotes.length === 0) return null;

  return (
    <Section eyebrow={content.title} tight>
      {stats.length > 0 ? (
        <dl className="grid-editorial">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rule-hairline tablet:col-span-6 desktop:col-span-3 col-span-6 pt-5"
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-4xl tracking-tight">{stat.value}</dd>
              <p className="type-meta text-foreground-subtle mt-2">{stat.label}</p>
            </div>
          ))}
        </dl>
      ) : null}

      {quotes.length > 0 ? (
        <div className="grid-editorial mt-16">
          {quotes.map((testimonial) => (
            <figure key={testimonial.id} className="desktop:col-span-6 col-span-12">
              <blockquote className="type-subheading font-display">
                {`“${testimonial.quote}”`}
              </blockquote>
              <figcaption className="type-meta text-foreground-subtle mt-4">
                {[testimonial.clientName, testimonial.clientRole, testimonial.projectName]
                  .filter(Boolean)
                  .join(" — ")}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}
    </Section>
  );
}
