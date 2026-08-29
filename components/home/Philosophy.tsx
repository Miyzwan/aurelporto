import { Section } from "@/components/public/Section";
import type { PhilosophyContent } from "@/types/content";

interface PhilosophyProps {
  content: PhilosophyContent;
}

export function Philosophy({ content }: PhilosophyProps) {
  const items = content.items.filter((item) => item.title.trim() || item.body.trim());
  if (items.length === 0) return null;

  const intro = content.intro.trim();

  return (
    <Section eyebrow={content.title}>
      {intro ? <p className="type-heading container-reading mb-16">{intro}</p> : null}

      <dl className="grid-editorial">
        {items.map((item) => (
          <div
            key={item.title}
            className="rule-hairline tablet:col-span-6 desktop:col-span-3 col-span-12 pt-5"
          >
            <dt className="type-meta text-foreground-subtle">{item.title}</dt>
            <dd className="type-spec mt-3">{item.body}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
