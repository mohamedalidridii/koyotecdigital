// Client-side page transitions with Barba. The WebGL canvas, cursor and curtain stay alive;
// only the page container is swapped, and the <head> SEO tags are synced from the new page.
import barba from "@barba/core";
import { gsap, ScrollTrigger, SplitText } from "./gsap.js";
import { gl } from "./gl.js";
import { scroll } from "./scroll.js";
import { resetCursor } from "./cursor.js";

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
  const panel = document.querySelector(".curtain-panel");
  const label = document.querySelector(".curtain-label");
  let labelSplit = null;

  barba.init({
    preventRunning: true,
    timeout: 8000,
    transitions: [
      {
        name: "night-curtain",
        async leave({ current, trigger }) {
          // the destination's name rides on the curtain
          const text = trigger instanceof Element ? (trigger.querySelector(".menu-name")?.textContent || trigger.textContent) : "";
          label.textContent = text.replace(/[→↗]/g, "").trim().slice(0, 28);
          labelSplit?.revert();
          labelSplit = SplitText.create(label, { type: "chars", mask: "chars" });

          gl.scatter(1, 0.9);
          await gsap
            .timeline()
            .set(panel, { clipPath: "inset(100% 0 0 0)" })
            .to(panel, { clipPath: "inset(0% 0 0 0)", duration: 0.85, ease: "koy.io" }, 0)
            .from(labelSplit.chars, { yPercent: 110, duration: 0.7, stagger: 0.025 }, 0.35)
            .to(current.container, { y: -80, duration: 0.85, ease: "koy.io" }, 0);
          unmount(current.container);
        },
        enter({ next }) {
          scroll.to(0, { immediate: true, force: true });
          window.scrollTo(0, 0);
          resetCursor();
          let release;
          const ready = new Promise((r) => (release = r));
          mount(next.container, { ready });
          gl.scatter(0, 1.4);
          gsap
            .timeline({ delay: 0.15 })
            .to(labelSplit.chars, { yPercent: -110, duration: 0.6, stagger: 0.02, ease: "koy.io" }, 0)
            .to(panel, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "koy.io" }, 0.2)
            .call(release, null, 0.55);
        },
      },
    ],
  });

  barba.hooks.beforeEnter(({ next }) => syncHead(next.html));
  barba.hooks.after(() => ScrollTrigger.refresh());
}
