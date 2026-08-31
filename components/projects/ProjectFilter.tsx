"use client";

import Link from "next/link";

import { trackPortfolioEvent } from "@/lib/analytics/tracker";
import type { ProjectFilterOption } from "@/lib/content/project-filters";
import { cn } from "@/lib/utils/cn";

export type { ProjectFilterOption };
export { buildFilterOptions } from "@/lib/content/project-filters";

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
                onClick={() =>
                  trackPortfolioEvent("project_filter_used", {
                    category: option.value ?? "all",
                  })
                }
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
