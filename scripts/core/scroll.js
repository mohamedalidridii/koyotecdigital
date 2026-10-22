// Locomotive Scroll v5 (Lenis inside) driven by the GSAP ticker, so ScrollTrigger,
// data-scroll parallax and the WebGL stage all read the same smoothed scroll each frame.
import LocomotiveScroll from "locomotive-scroll";
import { gsap, ScrollTrigger } from "./gsap.js";
import { reduced } from "./env.js";

let loco = null;

export function initScroll() {
  loco = new LocomotiveScroll({
    lenisOptions: {
      lerp: reduced ? 1 : 0.085,
      smoothWheel: !reduced,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    },
    scrollCallback: () => ScrollTrigger.update(),
    initCustomTicker: (render) => gsap.ticker.add(render),
    destroyCustomTicker: (render) => gsap.ticker.remove(render),
  });
  gsap.ticker.lagSmoothing(0);
  return loco;
}

export const scroll = {
  get lenis() {
    return loco?.lenisInstance ?? null;
  },
  get y() {
    return loco?.lenisInstance?.scroll ?? window.scrollY;
  },
  get velocity() {
    return loco?.lenisInstance?.velocity ?? 0;
  },
  to(target, opts = {}) {
    if (loco) loco.scrollTo(target, opts);
    else window.scrollTo(0, typeof target === "number" ? target : 0);
  },
  // lock/unlock without stopping the shared ticker
  lock() {
    loco?.lenisInstance?.stop();
  },
  unlock() {
    loco?.lenisInstance?.start();
  },
  add(container) {
    loco?.addScrollElements(container);
  },
  remove(container) {
    loco?.removeScrollElements(container);
  },
  resize() {
    loco?.resize();
  },
};
