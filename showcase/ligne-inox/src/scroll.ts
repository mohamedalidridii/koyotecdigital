import LocomotiveScroll from 'locomotive-scroll';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let loco: LocomotiveScroll | null = null;
let nativeLast = 0;
let nativeVelocity = 0;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lenis = () => loco?.lenisInstance ?? null;

/**
 * Locomotive Scroll v5 (Lenis inside) driven by GSAP's ticker, so smooth scroll, the
 * data-scroll-speed parallax, ScrollTrigger and the WebGL loop all advance on the same frame.
 */
export function initScroll(smooth: boolean) {
  gsap.ticker.lagSmoothing(0);
  if (!smooth) {
    gsap.ticker.add(() => {
      nativeVelocity += (scrollY - nativeLast - nativeVelocity) * 0.2;
      nativeLast = scrollY;
    });
    return;
  }
  loco = new LocomotiveScroll({
    lenisOptions: { lerp: 0.085, wheelMultiplier: 0.95, touchMultiplier: 1.4 },
    autoStart: false,
    scrollCallback: () => ScrollTrigger.update(),
    initCustomTicker: (render) => gsap.ticker.add(render),
    destroyCustomTicker: (render) => gsap.ticker.remove(render),
  });
  // Locomotive only starts its ticker on start(); run it from the beginning so instant jumps
  // and the preloader frame are applied, and keep Lenis itself stopped until the intro ends.
  loco.start();
  lenis()?.stop();
}

export function startScroll() {
  lenis()?.start();
}

export function lockScroll(locked: boolean) {
  if (locked) lenis()?.stop();
  else lenis()?.start();
}

/** Instant jump, used while the transition curtain hides the page. */
export function jumpTo(y: number) {
  const l = lenis();
  if (l) l.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}

export function velocity() {
  return lenis()?.velocity ?? nativeVelocity;
}

export function scrollTo(target: string | HTMLElement | number) {
  const l = lenis();
  if (l) {
    l.scrollTo(target, { duration: 1.8, easing: easeInOutCubic, force: true });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (typeof el === 'number') window.scrollTo({ top: el });
  else el?.scrollIntoView({ behavior: 'auto' });
}

/** Page swaps: let Locomotive forget the old [data-scroll] elements and pick up the new ones. */
export function swapScrollElements(container: HTMLElement, phase: 'remove' | 'add') {
  if (!loco) return;
  if (phase === 'remove') loco.removeScrollElements(container);
  else loco.addScrollElements(container);
}

export function resizeScroll() {
  loco?.resize();
}
