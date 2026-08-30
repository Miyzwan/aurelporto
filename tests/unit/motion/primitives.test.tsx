import { render, screen } from "@testing-library/react";
import Image from "next/image";
import { beforeEach, describe, expect, it } from "vitest";

import { ImageReveal, MaskReveal, ParallaxMedia, VelocityStrip } from "@/components/motion";

function installMatchMedia({ reducedMotion = false } = {}) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)" && reducedMotion,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

describe("motion primitives", () => {
  beforeEach(() => {
    installMatchMedia();
  });

  it("keeps masked content readable when the animation is disabled", () => {
    render(
      <MaskReveal disabled>
        <h2>Spatial rhythm</h2>
      </MaskReveal>,
    );

    expect(screen.getByRole("heading", { name: "Spatial rhythm" })).toBeVisible();
    expect(document.querySelector('[data-motion="mask-reveal"]')).toBeInTheDocument();
  });

  it("renders media content without requiring animation to reveal it", () => {
    render(
      <>
        <ImageReveal disabled>
          <Image src="/fixtures/hero.png" alt="Interior study" width={1600} height={900} />
        </ImageReveal>
        <ParallaxMedia disabled>
          <Image src="/fixtures/material-1.png" alt="Material study" width={1200} height={1200} />
        </ParallaxMedia>
      </>,
    );

    expect(screen.getByRole("img", { name: "Interior study" })).toBeVisible();
    expect(screen.getByRole("img", { name: "Material study" })).toBeVisible();
    expect(document.querySelector('[data-motion="image-reveal"]')).toBeInTheDocument();
    expect(document.querySelector('[data-motion="parallax-media"]')).toBeInTheDocument();
  });

  it("keeps all primitive content visible when reduced motion is preferred", () => {
    installMatchMedia({ reducedMotion: true });

    render(
      <>
        <MaskReveal>
          <p>Readable without motion</p>
        </MaskReveal>
        <VelocityStrip>
          <span>Material and light</span>
        </VelocityStrip>
      </>,
    );

    expect(screen.getByText("Readable without motion")).toBeVisible();
    expect(screen.getByText("Material and light")).toBeVisible();
  });
});
