import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface SectionProps {
  id?: string;
  /** Small tracked label above the heading. Omitted entirely when empty. */
  eyebrow?: string | null;
  className?: string;
  tight?: boolean;
  children: ReactNode;
}

/**
 * Vertical rhythm wrapper. Section spacing lives here rather than on every
 * section component, so an omitted section leaves no residual gap — the two
 * sections either side simply meet at one spacing step.
 */
export function Section({ id, eyebrow, className, tight = false, children }: SectionProps) {
  const label = eyebrow?.trim();

  return (
    <section
      id={id}
      className={cn(
        "container-editorial",
        tight ? "py-(--spacing-section-tight)" : "py-(--spacing-section)",
        className,
      )}
    >
      {label ? <p className="type-meta text-foreground-subtle mb-8">{label}</p> : null}
      {children}
    </section>
  );
}
