"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";

import { gsap, registerMotionPlugins, ScrollTrigger } from "@/lib/gsap";
import {
  createSmoothScroll,
  SMOOTH_SCROLL_MEDIA_QUERY,
  type SmoothScrollInstance,
} from "@/lib/lenis";

interface SmoothScrollContextValue {
  lenis: SmoothScrollInstance | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({ lenis: null });

interface SmoothScrollProviderProps {
  children: ReactNode;
}

/**
 * Keeps one Lenis instance and one GSAP ticker for the public layout. The
 * provider persists through route navigation, so navigation cannot register a
 * second ticker or duplicate ScrollTrigger updates.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [lenis, setLenis] = useState<SmoothScrollInstance | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(SMOOTH_SCROLL_MEDIA_QUERY);
    let instance: SmoothScrollInstance | null = null;

    const raf = (time: number) => {
      instance?.raf(time * 1000);
    };

    const updateScrollTrigger = () => {
      ScrollTrigger.update();
    };

    const destroy = () => {
      if (!instance) return;

      instance.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(raf);
      instance.destroy();
      instance = null;
      setLenis(null);
    };

    const create = () => {
      if (shouldReduceMotion || !mediaQuery.matches || instance) return;

      registerMotionPlugins();
      instance = createSmoothScroll();
      instance.on("scroll", updateScrollTrigger);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      setLenis(instance);
    };

    const syncWithViewport = () => {
      if (shouldReduceMotion || !mediaQuery.matches) {
        destroy();
        return;
      }

      create();
    };

    syncWithViewport();
    mediaQuery.addEventListener("change", syncWithViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncWithViewport);
      destroy();
    };
  }, [shouldReduceMotion]);

  const contextValue = useMemo(() => ({ lenis }), [lenis]);

  return (
    <SmoothScrollContext.Provider value={contextValue}>{children}</SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
