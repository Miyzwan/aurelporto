import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Media } from "@/components/public/Media";
import type { MediaAsset } from "@/types/content";

const image: MediaAsset = {
  id: "img-1",
  bucket: "portfolio-public",
  storagePath: "/fixtures/reception.jpg",
  mediaType: "image",
  altText: "Reception desk framed by a slatted timber screen",
  caption: null,
  photographer: null,
  width: 2400,
  height: 1600,
  posterPath: null,
  mimeType: "image/jpeg",
};

const video: MediaAsset = {
  ...image,
  id: "vid-1",
  mediaType: "video",
  storagePath: "/fixtures/walkthrough.mp4",
  posterPath: "/fixtures/walkthrough-poster.jpg",
  mimeType: "video/mp4",
  width: null,
  height: null,
};

function frameOf(container: HTMLElement): HTMLElement {
  const frame = container.querySelector<HTMLElement>("[style*='aspect-ratio']");
  if (!frame) throw new Error("no ratio-locked frame rendered");
  return frame;
}

describe("Media", () => {
  it("reserves space from the intrinsic ratio", () => {
    const { container } = render(<Media asset={image} />);
    expect(frameOf(container).style.aspectRatio).toBe("1.5 / 1");
  });

  it("falls back to a declared ratio when dimensions are unknown", () => {
    const { container } = render(<Media asset={{ ...image, width: null, height: null }} />);
    // Never zero-height: a missing width/height must not collapse the layout.
    expect(frameOf(container).style.aspectRatio).not.toBe("");
  });

  it("lets an explicit ratio override the intrinsic one", () => {
    const { container } = render(<Media asset={image} aspectRatio={1} />);
    expect(frameOf(container).style.aspectRatio).toBe("1 / 1");
  });

  it("always exposes alt text", () => {
    render(<Media asset={image} />);
    expect(screen.getByAltText(image.altText)).toBeInTheDocument();
  });

  it("renders no figcaption when caption and photographer are empty", () => {
    const { container } = render(<Media asset={image} />);
    expect(container.querySelector("figcaption")).toBeNull();
    expect(container.querySelector("figure")).toBeNull();
  });

  it("renders a caption when there is something to say", () => {
    render(<Media asset={{ ...image, caption: "Specialty lounge", photographer: "Studio" }} />);
    expect(screen.getByText("Specialty lounge")).toBeInTheDocument();
    expect(screen.getByText("Photography: Studio")).toBeInTheDocument();
  });

  it("gives a video controls and no autoplay by default", () => {
    const { container } = render(<Media asset={video} />);
    const element = container.querySelector("video");

    expect(element).toHaveAttribute("controls");
    expect(element).not.toHaveAttribute("autoplay");
    expect(element).toHaveAttribute("playsinline");
    expect(element).toHaveAttribute("poster", "/fixtures/walkthrough-poster.jpg");
  });

  it("only loops silently when ambient playback is opted into", () => {
    const { container } = render(<Media asset={video} ambient />);
    const element = container.querySelector("video");

    expect(element).toHaveAttribute("autoplay");
    expect(element).toHaveAttribute("loop");
    // React assigns `muted` as a DOM property, not an attribute. The property
    // is what the browser's autoplay policy actually reads.
    expect((element as HTMLVideoElement).muted).toBe(true);
    expect(element).not.toHaveAttribute("controls");
  });
});
