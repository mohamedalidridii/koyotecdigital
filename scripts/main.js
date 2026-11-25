// Single entry for every page. Core systems start once; page modules mount into the Barba
// container and are torn down with it, so navigation never leaks triggers or listeners.
// 2026-11 redesign (LIFT): no particle stage, custom cursor, preloader or hero intro. What is on
// screen when a page opens is shown at once; only content further down reveals as it arrives.
import { gsap, ScrollTrigger } from "./core/gsap.js";
import { reduced } from "./core/env.js";
import { initScroll, scroll } from "./core/scroll.js";
import { initNav } from "./core/nav.js";
import { initRouter } from "./core/router.js";
import { autoSplits, drawLines } from "./core/reveal.js";
import { serviceHover, statement, rows } from "./sections/home.js";
import { faq, cta, footer, contactForm, article, scrollDepth, engagedTime, trackContactCopy, bindTrackedClicks } from "./sections/common.js";
import { artTheme, artHero, artExpo, artViewer, staticLetters } from "./sections/art.js";
import { careersForm, careersPoles } from "./sections/careers.js";
import { founderTheme, founderHero, founderManifesto, founderCounters, founderReel, founderChapters, founderStage } from "./sections/founder.js";

// motion modules per Barba namespace (nav, form and FAQ run everywhere, even with reduced motion)
const PAGES = {
  home: [serviceHover, statement, rows],
  services: [serviceHover, rows],
  contact: [rows],
  careers: [careersPoles, rows],
  blog: [rows],
  article: [article],
  art: [artHero, artExpo],
  mesh: [],
  founder: [founderHero, founderManifesto, founderCounters, founderReel, founderChapters, founderStage],
};
// per-page systems that run even with reduced motion
const ALWAYS = { services: [scrollDepth], article: [scrollDepth], home: [staticLetters], art: [artTheme, artViewer, staticLetters], mesh: [], founder: [founderTheme], careers: [careersForm] };

let ctx = null;
let cleanups = [];

function mount(container) {
  const ns = container.dataset.barbaNamespace;
  const ready = Promise.resolve();
  scroll.add(container);

  ctx = gsap.context(() => {
    cleanups = [initNav(container), faq(container), contactForm(container), engagedTime(), ...(ALWAYS[ns] || []).map((fn) => fn(container, { ready }))];
    if (!reduced) (PAGES[ns] || []).forEach((fn) => cleanups.push(fn(container, { ready })));
  }, container);

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
        cta(container);
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
  scroll.remove(container);
}

function start() {
  bindTrackedClicks(); // first: analytics clicks keep working even if the motion layer fails to boot
  // the WhatsApp button joins once the visitor has scrolled a little: heroes keep their own actions free of it
  const wa = document.querySelector(".wa-float");
  if (wa) {
    const check = () => wa.classList.toggle("is-in", window.scrollY > window.innerHeight * 0.3);
    check();
    window.addEventListener("scroll", check, { passive: true });
  }
  trackContactCopy();
  initScroll();
  const container = document.querySelector('[data-barba="container"]');
  mount(container);
  if (!reduced) initRouter({ mount, unmount });
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

try {
  start();
} catch (err) {
  console.error("Motion layer disabled:", err);
  ctx?.revert();
}
