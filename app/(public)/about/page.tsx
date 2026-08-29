import { Section } from "@/components/public/Section";
import { placeholderSiteSettings } from "@/lib/content/placeholder-shell";
import {
  placeholderAboutIntro,
  placeholderEducation,
  placeholderExperience,
  placeholderSoftware,
} from "@/lib/content/placeholder-pages";

/**
 * The portrait slot is intentionally empty: CLIENT_CONTEXT Rule 6 puts the
 * personal portrait last in image priority, and no approved portrait exists.
 * INT-008 renders it from `site_settings` once one is supplied.
 */
export default function AboutPage() {
  return (
    <>
      <Section eyebrow="About">
        <div className="grid-editorial">
          <h1 className="type-heading desktop:col-span-8 col-span-12">
            {placeholderSiteSettings.siteName}
          </h1>
          <p className="type-body desktop:col-span-7 col-span-12 mt-8">{placeholderAboutIntro}</p>
        </div>
      </Section>

      <Section eyebrow="Education" tight>
        <dl className="border-line border-t">
          {placeholderEducation.map((entry) => (
            <div key={entry.institution} className="border-line grid-editorial border-b py-6">
              <dt className="font-display desktop:col-span-4 col-span-12 text-xl tracking-tight">
                {entry.institution}
              </dt>
              <dd className="desktop:col-span-5 desktop:col-start-6 desktop:mt-0 col-span-12 mt-2">
                <p className="type-spec">{entry.qualification}</p>
                {entry.detail ? (
                  <p className="type-spec text-foreground-muted mt-1">{entry.detail}</p>
                ) : null}
              </dd>
              {entry.period ? (
                <dd className="type-meta text-foreground-subtle desktop:col-span-2 desktop:mt-0 col-span-12 mt-2">
                  {entry.period}
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      </Section>

      <Section eyebrow="Software" tight>
        <dl className="grid-editorial">
          {placeholderSoftware.map((tool) => (
            <div
              key={tool.name}
              className="rule-hairline tablet:col-span-4 desktop:col-span-3 col-span-6 pt-4"
            >
              <dt className="type-spec">{tool.name}</dt>
              <dd className="type-meta text-foreground-subtle mt-1">{tool.application}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section eyebrow="Experience" tight>
        <ul className="border-line border-t">
          {placeholderExperience.map((entry) => (
            <li
              key={`${entry.title}-${entry.year}`}
              className="border-line grid-editorial border-b py-6"
            >
              <p className="type-meta text-foreground-subtle desktop:col-span-2 col-span-12 tabular-nums">
                {entry.year}
              </p>
              <div className="desktop:col-span-4 desktop:mt-0 col-span-12 mt-2">
                <h2 className="font-display text-xl tracking-tight">{entry.title}</h2>
                {entry.organisation ? (
                  <p className="type-meta text-foreground-subtle mt-1">{entry.organisation}</p>
                ) : null}
              </div>
              <p className="type-spec text-foreground-muted desktop:col-span-5 desktop:col-start-8 desktop:mt-0 col-span-12 mt-2">
                {entry.description}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
