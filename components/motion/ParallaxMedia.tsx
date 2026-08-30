"use client";

import { useGSAP } from "@gsap/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { useReducedMotion } from "motion/react";

import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils/cn";

interface ParallaxMediaProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  strength?: number;
  disabled?: boolean;
}

/** Moves only the inner media layer, preserving the wrapper's layout geometry. */
export function ParallaxMedia({
  children,
  className,
  contentClassName,
  strength = 6,
  disabled = false,
}: ParallaxMediaProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useGSAP(
    () => {
      if (shouldReduceMotion || disabled) return;

      const root = rootRef.current;
      const content = root?.querySelector<HTMLElement>("[data-parallax-content]");
      if (!root || !content) return;

      const media = gsap.matchMedia();
      const distance = Math.min(Math.max(Math.abs(strength), 0), 8);

      media.add("(min-width: 768px)", () => {
        gsap.fromTo(
          content,
          { yPercent: -distance },
          {
            yPercent: distance,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      return () => media.revert();
    },
    {
      dependencies: [disabled, shouldReduceMotion, strength],
      revertOnUpdate: true,
      scope: rootRef,
    },
  );

  return (
    <div ref={rootRef} className={cn("overflow-hidden", className)} data-motion="parallax-media">
      <div data-parallax-content className={contentClassName}>
        {children}
      </div>
    </div>
  );
}
