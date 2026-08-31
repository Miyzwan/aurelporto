/**
 * Neutral project filter helpers decoupled from client components.
 * Can be safely imported by both React Server Components and Client Components.
 */

export interface ProjectFilterOption {
  /** Query value, e.g. "hospitality". `null` is the All option. */
  value: string | null;
  label: string;
  count: number;
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
