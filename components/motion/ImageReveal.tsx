"use client";

import { useGSAP } from "@gsap/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { useReducedMotion } from "motion/react";

import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils/cn";

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  delay?: number;
  disabled?: boolean;
}

/** Adds a restrained image entrance while keeping the media in the document. */
export function ImageReveal({
  children,
  className,
  contentClassName,
  delay = 0,
  disabled = false,
}: ImageRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useGSAP(
    () => {
      const content = rootRef.current?.querySelector<HTMLElement>("[data-image-reveal-content]");
      if (!content || shouldReduceMotion || disabled) return;

      gsap.fromTo(
        content,
        { opacity: 0, yPercent: 4 },
        {
          opacity: 1,
          yPercent: 0,
          delay,
          duration: 0.9,
          ease: "power3.out",
        },
      );
    },
    {
      dependencies: [delay, disabled, shouldReduceMotion],
      revertOnUpdate: true,
      scope: rootRef,
    },
  );

  return (
    <div ref={rootRef} className={cn("overflow-hidden", className)} data-motion="image-reveal">
      <div data-image-reveal-content className={contentClassName}>
        {children}
      </div>
    </div>
  );
}
