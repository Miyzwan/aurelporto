"use client";

import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils/cn";

interface ProcessProgressProps {
  children: ReactNode;
  className?: string;
}

/** Tracks the process section's reading progress without pinning the page. */
export function ProcessProgress({ children, className }: ProcessProgressProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      const fill = root?.querySelector<HTMLElement>("[data-process-progress-fill]");
      if (!root || !fill || shouldReduceMotion) return;

      gsap.fromTo(
        fill,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top 75%",
            end: "bottom 60%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    {
      dependencies: [shouldReduceMotion],
      revertOnUpdate: true,
      scope: rootRef,
    },
  );

  return (
    <div ref={rootRef} className={cn(className)} data-motion="process-progress">
      <div aria-hidden="true" className="bg-line mb-12 h-px">
        <div data-process-progress-fill className="bg-ink h-full w-full origin-left" />
      </div>
      {children}
    </div>
  );
}
