"use client";

import { useGSAP } from "@gsap/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { useReducedMotion } from "motion/react";

import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils/cn";

interface MaskRevealProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  delay?: number;
  disabled?: boolean;
}

/** Reveals text from its overflow mask without hiding it from no-JS visitors. */
export function MaskReveal({
  children,
  className,
  contentClassName,
  delay = 0,
  disabled = false,
}: MaskRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useGSAP(
    () => {
      const content = rootRef.current?.querySelector<HTMLElement>("[data-mask-reveal-content]");
      if (!content || shouldReduceMotion || disabled) return;

      gsap.fromTo(
        content,
        { yPercent: 105 },
        {
          yPercent: 0,
          delay,
          duration: 1,
          ease: "power4.out",
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
    <div ref={rootRef} className={cn("overflow-hidden", className)} data-motion="mask-reveal">
      <div data-mask-reveal-content className={contentClassName}>
        {children}
      </div>
    </div>
  );
}
