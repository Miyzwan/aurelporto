import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export interface ProjectFilterOption {
  /** Query value, e.g. "hospitality". `null` is the All option. */
  value: string | null;
  label: string;
  count: number;
}

interface ProjectFilterProps {
  options: ProjectFilterOption[];
  active: string | null;
  basePath?: string;
}

/**
 * Plain links carrying a `category` query value.
 *
 * Links rather than buttons because the filtered index is a distinct,
 * shareable URL, and because the filter then works with JavaScript disabled
 * (master plan constraint 25) and is keyboard- and touch-navigable for free.
 * `scroll={false}` keeps the reading position when the list re-renders.
 */
export function ProjectFilter({ options, active, basePath = "/projects" }: ProjectFilterProps) {
  if (options.length <= 2) return null;

  return (
    <nav aria-label="Filter projects by category">
      <ul className="-mx-2 flex flex-wrap items-center">
        {options.map((option) => {
          const isActive = option.value === active;
          const href = option.value ? `${basePath}?category=${option.value}` : basePath;

          return (
            <li key={option.value ?? "all"}>
              <Link
                href={href}
                scroll={false}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "type-meta inline-flex items-baseline gap-1.5 px-2 py-3 transition-colors duration-(--duration-quick)",
                  isActive
                    ? "text-foreground underline underline-offset-8"
                    : "text-foreground-subtle hover:text-foreground",
                )}
              >
                {option.label}
                <span className="tabular-nums opacity-60">{option.count}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Builds the filter set from the projects that actually exist. PRD section 27
 * requires that an empty category never appears, and CLIENT_CONTEXT section 10
 * forbids adding categories for visual symmetry.
 */
export function buildFilterOptions(
  projects: { projectType: string }[],
  slugify: (value: string) => string,
): ProjectFilterOption[] {
  const counts = new Map<string, { label: string; count: number }>();

  for (const project of projects) {
    const label = project.projectType.trim();
    if (!label) continue;
    const value = slugify(label);
    const entry = counts.get(value);
    if (entry) {
      entry.count += 1;
    } else {
      counts.set(value, { label, count: 1 });
    }
  }

  return [
    { value: null, label: "All", count: projects.length },
    ...Array.from(counts.entries())
      .sort((a, b) => b[1].count - a[1].count || a[1].label.localeCompare(b[1].label))
      .map(([value, { label, count }]) => ({ value, label, count })),
  ];
}
