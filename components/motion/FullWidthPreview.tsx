"use client";

import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils/cn";

interface FullWidthPreviewProps {
  children: ReactNode;
  className?: string;
}

/** Reveals the next project's preview from a contained crop to full width. */
export function FullWidthPreview({ children, className }: FullWidthPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (shouldReduceMotion) return;

      const root = rootRef.current;
      const preview = root?.querySelector<HTMLElement>("[data-full-width-preview-content]");
      if (!root || !preview) return;

      const media = gsap.matchMedia();
      media.add("(min-width: 768px)", () => {
        gsap.fromTo(
          preview,
          { clipPath: "inset(0 14% 0 14%)", yPercent: 3 },
          {
            clipPath: "inset(0 0% 0 0%)",
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top 84%",
              end: "top 44%",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      return () => media.revert();
    },
    {
      dependencies: [shouldReduceMotion],
      revertOnUpdate: true,
      scope: rootRef,
    },
  );

  return (
    <div ref={rootRef} className={cn("w-full", className)} data-motion="full-width-preview">
      <div data-full-width-preview-content>{children}</div>
    </div>
  );
}
