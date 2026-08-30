"use client";

import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";

import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils/cn";

interface HeroSpaceRevealProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

/**
 * Lets the hero frame open into the page with a short desktop-only scrub.
 * The transform applies to the frame, not the photography, so the image keeps
 * its perspective and stays within the FE-010 scale constraint.
 */
export function HeroSpaceReveal({
  children,
  className,
  contentClassName,
  disabled = false,
}: HeroSpaceRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (shouldReduceMotion || disabled) return;

      const root = rootRef.current;
      const frame = root?.querySelector<HTMLElement>("[data-space-reveal-frame]");
      if (!root || !frame) return;

      const media = gsap.matchMedia();

      media.add("(min-width: 768px)", () => {
        gsap.fromTo(
          frame,
          { scale: 0.96 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "top 35%",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      return () => media.revert();
    },
    {
      dependencies: [disabled, shouldReduceMotion],
      revertOnUpdate: true,
      scope: rootRef,
    },
  );

  return (
    <div
      ref={rootRef}
      className={cn("bg-surface-sunken relative overflow-hidden", className)}
      data-motion="hero-space-reveal"
    >
      <div data-space-reveal-frame className={cn("relative origin-center", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
