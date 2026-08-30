import Lenis from "lenis";

/** Smooth scrolling is intentionally limited to tablet and desktop layouts. */
export const SMOOTH_SCROLL_MEDIA_QUERY = "(min-width: 768px)";

export function createSmoothScroll() {
  return new Lenis({
    anchors: true,
    autoRaf: false,
    respectReducedMotion: true,
    smoothWheel: true,
    syncTouch: false,
  });
}

export type SmoothScrollInstance = Lenis;
