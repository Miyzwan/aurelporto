"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

import { cn } from "@/lib/utils/cn";

import { useSmoothScroll } from "./SmoothScrollProvider";

interface VelocityStripProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Responds gently to Lenis velocity without storing per-frame values in React state. */
export function VelocityStrip({ children, className, contentClassName }: VelocityStripProps) {
  const { lenis } = useSmoothScroll();
  const shouldReduceMotion = useReducedMotion();
  const velocity = useMotionValue(0);
  const smoothedVelocity = useSpring(velocity, { damping: 24, stiffness: 120 });
  const x = useTransform(smoothedVelocity, (value) => clamp(value * 1.5, -24, 24));

  useEffect(() => {
    velocity.set(0);
    if (!lenis || shouldReduceMotion) return;

    const unsubscribe = lenis.on("scroll", (currentLenis) => {
      velocity.set(currentLenis.velocity);
    });

    return () => {
      unsubscribe();
      velocity.set(0);
    };
  }, [lenis, shouldReduceMotion, velocity]);

  return (
    <div className={cn("overflow-hidden", className)} data-motion="velocity-strip">
      <motion.div
        className={cn("w-max", contentClassName)}
        style={shouldReduceMotion ? undefined : { x }}
      >
        {children}
      </motion.div>
    </div>
  );
}
