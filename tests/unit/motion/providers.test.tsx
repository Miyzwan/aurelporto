import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const lenis = {
    destroy: vi.fn(),
    off: vi.fn(),
    on: vi.fn(() => vi.fn()),
    raf: vi.fn(),
  };

  return {
    createSmoothScroll: vi.fn(() => lenis),
    gsap: {
      ticker: {
        add: vi.fn(),
        lagSmoothing: vi.fn(),
        remove: vi.fn(),
      },
    },
    lenis,
    reducedMotion: false,
    registerMotionPlugins: vi.fn(),
    ScrollTrigger: { update: vi.fn() },
  };
});

vi.mock("@/lib/gsap", () => ({
  gsap: mocks.gsap,
  registerMotionPlugins: mocks.registerMotionPlugins,
  ScrollTrigger: mocks.ScrollTrigger,
}));

vi.mock("@/lib/lenis", () => ({
  createSmoothScroll: mocks.createSmoothScroll,
  SMOOTH_SCROLL_MEDIA_QUERY: "(min-width: 768px)",
}));

vi.mock("motion/react", () => ({
  useReducedMotion: () => mocks.reducedMotion,
}));

import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";

function installMatchMedia({ desktop = true, reducedMotion = false } = {}) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches:
        query === "(min-width: 768px)"
          ? desktop
          : query === "(prefers-reduced-motion: reduce)" && reducedMotion,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }),
  });
}

describe("SmoothScrollProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.reducedMotion = false;
    installMatchMedia();
  });

  it("creates one Lenis instance and one ticker for a mounted public layout", () => {
    const view = render(
      <SmoothScrollProvider>
        <p>Public content</p>
      </SmoothScrollProvider>,
    );

    view.rerender(
      <SmoothScrollProvider>
        <p>New route content</p>
      </SmoothScrollProvider>,
    );

    expect(mocks.createSmoothScroll).toHaveBeenCalledTimes(1);
    expect(mocks.gsap.ticker.add).toHaveBeenCalledTimes(1);
    expect(mocks.registerMotionPlugins).toHaveBeenCalledTimes(1);
  });

  it("destroys Lenis and removes its ticker during cleanup", () => {
    const view = render(
      <SmoothScrollProvider>
        <p>Public content</p>
      </SmoothScrollProvider>,
    );

    view.unmount();

    expect(mocks.lenis.destroy).toHaveBeenCalledTimes(1);
    expect(mocks.gsap.ticker.remove).toHaveBeenCalledTimes(1);
    expect(mocks.lenis.off).toHaveBeenCalledTimes(1);
  });

  it("does not create Lenis when the viewport is below the supported breakpoint", () => {
    installMatchMedia({ desktop: false });

    render(
      <SmoothScrollProvider>
        <p>Mobile content</p>
      </SmoothScrollProvider>,
    );

    expect(mocks.createSmoothScroll).not.toHaveBeenCalled();
    expect(mocks.gsap.ticker.add).not.toHaveBeenCalled();
  });

  it("does not create Lenis when reduced motion is preferred", () => {
    mocks.reducedMotion = true;
    installMatchMedia({ reducedMotion: true });

    render(
      <SmoothScrollProvider>
        <p>Accessible content</p>
      </SmoothScrollProvider>,
    );

    expect(mocks.createSmoothScroll).not.toHaveBeenCalled();
    expect(mocks.gsap.ticker.add).not.toHaveBeenCalled();
  });
});
