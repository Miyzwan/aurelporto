"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

interface ReducedMotionProviderProps {
  children: ReactNode;
}

/** Applies the user's motion preference to every Motion descendant. */
export function ReducedMotionProvider({ children }: ReducedMotionProviderProps) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
