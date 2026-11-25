// Client-side page transitions with Barba: only the page container is swapped, and the <head> SEO tags
// are synced from the new page. 2026-11 redesign: a short cross-fade (under 0.4 s in total), so a click
// never waits on an animation.
import barba from "@barba/core";
import { gsap, ScrollTrigger } from "./gsap.js";
import { scroll } from "./scroll.js";

const HEAD_TAGS = [
  "title",
  'meta[name="description"]',
  'meta[name="robots"]',
  'link[rel="canonical"]',
  'link[rel="alternate"]',
  'meta[property^="og:"]',
  'meta[name^="twitter:"]',
  'script[type="application/ld+json"]',
].join(",");

function syncHead(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  document.head.querySelectorAll(HEAD_TAGS).forEach((el) => el.remove());
  const anchor = document.head.querySelector('link[rel="stylesheet"]');
  doc.head.querySelectorAll(HEAD_TAGS).forEach((el) => document.head.insertBefore(document.importNode(el, true), anchor));
  document.documentElement.lang = doc.documentElement.lang;
}

export function initRouter({ mount, unmount }) {
  barba.init({
    preventRunning: true,
    timeout: 8000,
    transitions: [
      {
        name: "fade",
        async leave({ current }) {
          await gsap.to(current.container, { autoAlpha: 0, duration: 0.18, ease: "power1.out" });
          unmount(current.container);
        },
        enter({ next }) {
          scroll.to(0, { immediate: true, force: true });
          window.scrollTo(0, 0);
          mount(next.container);
          gsap.fromTo(next.container, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "power1.out", clearProps: "opacity,visibility" });
        },
      },
    ],
  });

  barba.hooks.beforeEnter(({ next }) => syncHead(next.html));
  barba.hooks.after(() => ScrollTrigger.refresh());
}
