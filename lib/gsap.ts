import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let pluginsRegistered = false;

/**
 * Registers GSAP plugins once in the browser bundle. The server can import
 * motion-aware client leaves during prerendering, but plugin registration must
 * wait until a browser exists.
 */
export function registerMotionPlugins() {
  if (pluginsRegistered || typeof window === "undefined") return;

  gsap.registerPlugin(ScrollTrigger, useGSAP);
  pluginsRegistered = true;
}

registerMotionPlugins();

export { gsap, ScrollTrigger };
