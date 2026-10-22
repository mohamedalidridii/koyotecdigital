// Single entry for every page. Core systems start once; page modules mount into the Barba
// container and are torn down with it, so navigation never leaks triggers or listeners.
import { gsap, ScrollTrigger } from "./core/gsap.js";
import { $, reduced } from "./core/env.js";
import { initScroll, scroll } from "./core/scroll.js";
import { bootGL, bindScenes, resetScenes, sceneAtViewport } from "./core/gl.js";
import { initCursor, magnetic } from "./core/cursor.js";
import { initNav } from "./core/nav.js";
import { runPreloader } from "./core/preloader.js";
import { initRouter } from "./core/router.js";
import { autoSplits, drawLines } from "./core/reveal.js";
import { homeHero, pageHero } from "./sections/intro.js";
import { serviceHover, statement, rows } from "./sections/home.js";
import { faq, cta, footer, contactForm, article } from "./sections/common.js";

// motion modules per Barba namespace (nav, form and FAQ run everywhere, even with reduced motion)
const PAGES = {
  home: [homeHero, serviceHover, statement, rows, cta],
  services: [pageHero, rows, cta],
  contact: [pageHero],
  blog: [pageHero, rows],
  article: [pageHero, article],
};

let ctx = null;
let cleanups = [];

function mount(container, { ready = Promise.resolve() } = {}) {
  const ns = container.dataset.barbaNamespace;
  scroll.add(container);

  ctx = gsap.context(() => {
    cleanups = [initNav(container), faq(container), contactForm(container)];
    if (!reduced) {
      cleanups.push(magnetic(container));
      (PAGES[ns] || [pageHero]).forEach((fn) => cleanups.push(fn(container, { ready })));
    }
    bindScenes($("[data-gl]", container));
  }, container);

  sceneAtViewport(container);
  ScrollTrigger.refresh();

  // below-the-fold reveals are not visible yet: prepare them once the main thread is idle
  if (!reduced) {
    const owner = ctx;
    const later = () => {
      if (ctx !== owner) return; // the page was already left
      owner.add(() => {
        autoSplits(container);
        drawLines(container);
        footer(container);
      });
      ScrollTrigger.refresh();
    };
    if ("requestIdleCallback" in window) requestIdleCallback(later, { timeout: 900 });
    else setTimeout(later, 200);
  }
}

function unmount(container) {
  cleanups.forEach((fn) => typeof fn === "function" && fn());
  cleanups = [];
  ctx?.revert();
  ctx = null;
  resetScenes();
  scroll.remove(container);
}

function start() {
  initScroll();
  bootGL();
  initCursor();
  const container = document.querySelector('[data-barba="container"]');
  mount(container, { ready: runPreloader() });
  if (!reduced) initRouter({ mount, unmount });
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

// never leave the page hidden behind an overlay if something throws during boot
try {
  start();
} catch (err) {
  console.error("Motion layer disabled:", err);
  ctx?.revert();
  document.querySelectorAll(".preloader, .curtain").forEach((el) => el.remove());
}
