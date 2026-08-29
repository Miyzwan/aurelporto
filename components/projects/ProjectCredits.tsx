import type { CreditItem } from "@/types/project-sections";

interface ProjectCreditsProps {
  items: CreditItem[];
}

/**
 * Only http(s) links are rendered as anchors. A credit URL is admin-entered
 * free text, so a `javascript:` or `data:` value must never reach an href.
 */
function safeExternalUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function ProjectCredits({ items }: ProjectCreditsProps) {
  const credits = items.filter((item) => item.name.trim());
  if (credits.length === 0) return null;

  return (
    <dl className="grid-editorial">
      {credits.map((credit, index) => {
        const href = safeExternalUrl(credit.url);
        return (
          <div
            key={`${credit.role}-${credit.name}-${index}`}
            className="rule-hairline tablet:col-span-6 desktop:col-span-3 col-span-12 pt-4"
          >
            <dt className="type-meta text-foreground-subtle">{credit.role}</dt>
            <dd className="type-spec mt-2">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener nofollow"
                  className="underline underline-offset-4"
                >
                  {credit.name}
                </a>
              ) : (
                credit.name
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
